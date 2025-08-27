const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor do Scribd Downloader está no ar!');
});

app.get('/download-scribd', async (req, res) => {
    const scribdUrl = req.query.url;
    if (!scribdUrl) {
        return res.status(400).json({ error: 'URL do Scribd é obrigatória.' });
    }

    console.log(`Iniciando processo para: ${scribdUrl}`);
    let browser = null;
    try {
        // ===================================================================
        // CORREÇÃO FINAL: Usando o caminho exato que o comando de build cria.
        // ===================================================================
        browser = await puppeteer.launch({
            executablePath: '/opt/render/.cache/puppeteer/chrome/linux-127.0.6533.88/chrome-linux/chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        await page.setDefaultNavigationTimeout(120000); 
        
        console.log('Navegando para a URL...');
        await page.goto(scribdUrl, { waitUntil: 'networkidle2' });
        console.log('Página carregada.');

        console.log('A rolar a página para carregar o documento completo...');
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
        console.log('Documento carregado.');

        const pageElements = await page.$$('div.document_page');
        if (pageElements.length === 0) {
            throw new Error('Nenhuma página de documento encontrada. O seletor pode estar desatualizado.');
        }
        console.log(`Encontradas ${pageElements.length} páginas.`);

        const pdfDoc = await PDFDocument.create();
        
        console.log('A tirar screenshots de cada página...');
        for (let i = 0; i < pageElements.length; i++) {
            const element = pageElements[i];
            const imageBuffer = await element.screenshot({ type: 'png' });

            const pngImage = await pdfDoc.embedPng(imageBuffer);
            const pagePdf = doc.addPage([pngImage.width, pngImage.height]);
            pagePdf.drawImage(pngImage, {
                x: 0,
                y: 0,
                width: pngImage.width,
                height: pngImage.height,
            });
            console.log(`Página ${i + 1} adicionada ao PDF.`);
        }

        const pdfBytes = await pdfDoc.save();
        const documentTitle = (await page.title()).replace(/[^a-z0-9]/gi, '_').toLowerCase();

        console.log('A enviar o PDF para o utilizador...');
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${documentTitle || 'documento'}.pdf"`,
            'Content-Length': pdfBytes.length
        });
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Ocorreu um erro:', error);
        res.status(500).json({ error: 'Falha ao processar o documento do Scribd.', details: error.message });
    } finally {
        if (browser) {
            console.log('A fechar o navegador...');
            await browser.close();
        }
    }
});

app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
});


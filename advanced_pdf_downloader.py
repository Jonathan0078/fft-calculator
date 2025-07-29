from flask import Blueprint, request, jsonify, send_file
import os
import tempfile
import asyncio
from playwright.async_api import async_playwright
import requests
from urllib.parse import urlparse, urljoin
import re
import time
import json
from bs4 import BeautifulSoup

advanced_pdf_bp = Blueprint('advanced_pdf', __name__)

class AdvancedPDFDownloader:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    async def download_from_slideshare_advanced(self, url):
        """Método avançado para baixar PDFs originais do SlideShare"""
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                # Configurar user agent
                await page.set_extra_http_headers({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                })
                
                # Navegar para a página
                await page.goto(url, wait_until='networkidle')
                await page.wait_for_timeout(3000)
                
                # Extrair ID da apresentação
                presentation_id = None
                id_match = re.search(r'/slideshow/[^/]+/(\d+)', url)
                if not id_match:
                    id_match = re.search(r'slideshare\.net/[^/]+/[^/]+-(\d+)', url)
                
                if id_match:
                    presentation_id = id_match.group(1)
                
                # Tentar encontrar links de download direto
                download_selectors = [
                    'a[href*=".pdf"]',
                    'a[href*="download"]',
                    '.download-btn',
                    '.btn-download',
                    'button[data-cy="download-button"]'
                ]
                
                for selector in download_selectors:
                    elements = await page.query_selector_all(selector)
                    for element in elements:
                        href = await element.get_attribute('href')
                        if href and ('.pdf' in href.lower() or 'download' in href.lower()):
                            if not href.startswith('http'):
                                href = urljoin(url, href)
                            
                            # Tentar baixar o arquivo
                            response = self.session.get(href, stream=True)
                            if response.status_code == 200 and 'application/pdf' in response.headers.get('content-type', ''):
                                filename = f"slideshare_{presentation_id or int(time.time())}.pdf"
                                filepath = os.path.join(self.temp_dir, filename)
                                
                                with open(filepath, 'wb') as f:
                                    for chunk in response.iter_content(chunk_size=8192):
                                        f.write(chunk)
                                
                                await browser.close()
                                return filepath, filename
                
                # Tentar extrair dados da API interna do SlideShare
                try:
                    # Procurar por dados JSON na página
                    scripts = await page.query_selector_all('script')
                    for script in scripts:
                        content = await script.inner_text()
                        if 'slideshow' in content and 'download' in content:
                            # Tentar extrair URLs de download
                            json_matches = re.findall(r'\{[^{}]*"download"[^{}]*\}', content)
                            for match in json_matches:
                                try:
                                    data = json.loads(match)
                                    if 'download' in data and data['download']:
                                        download_url = data['download']
                                        if not download_url.startswith('http'):
                                            download_url = urljoin(url, download_url)
                                        
                                        response = self.session.get(download_url, stream=True)
                                        if response.status_code == 200:
                                            filename = f"slideshare_{presentation_id or int(time.time())}.pdf"
                                            filepath = os.path.join(self.temp_dir, filename)
                                            
                                            with open(filepath, 'wb') as f:
                                                for chunk in response.iter_content(chunk_size=8192):
                                                    f.write(chunk)
                                            
                                            await browser.close()
                                            return filepath, filename
                                except:
                                    continue
                except:
                    pass
                
                # Se não conseguiu baixar o PDF original, tentar usar API externa
                if presentation_id:
                    try:
                        api_url = "https://slidesgrabby.com/api/"
                        api_data = {
                            "slideshare_url": url,
                            "format": "pdf"
                        }
                        
                        api_response = self.session.post(api_url, json=api_data, headers={
                            'Content-Type': 'application/json'
                        })
                        
                        if api_response.status_code == 200:
                            result = api_response.json()
                            if 'download_url' in result:
                                download_response = self.session.get(result['download_url'], stream=True)
                                if download_response.status_code == 200:
                                    filename = f"slideshare_{presentation_id}.pdf"
                                    filepath = os.path.join(self.temp_dir, filename)
                                    
                                    with open(filepath, 'wb') as f:
                                        for chunk in download_response.iter_content(chunk_size=8192):
                                            f.write(chunk)
                                    
                                    await browser.close()
                                    return filepath, filename
                    except:
                        pass
                
                # Como último recurso, gerar PDF da página
                filename = f"slideshare_page_{int(time.time())}.pdf"
                filepath = os.path.join(self.temp_dir, filename)
                
                await page.pdf(path=filepath, format='A4', print_background=True)
                await browser.close()
                
                return filepath, filename
                
        except Exception as e:
            return None, str(e)
    
    async def download_from_scribd_advanced(self, url):
        """Método avançado para baixar documentos originais do Scribd"""
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                # Configurar user agent
                await page.set_extra_http_headers({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                })
                
                # Navegar para a página
                await page.goto(url, wait_until='networkidle')
                await page.wait_for_timeout(5000)
                
                # Extrair ID do documento
                doc_id = None
                id_match = re.search(r'/document/(\d+)/', url)
                if not id_match:
                    id_match = re.search(r'/doc/(\d+)/', url)
                if not id_match:
                    id_match = re.search(r'/presentation/(\d+)/', url)
                
                if id_match:
                    doc_id = id_match.group(1)
                
                # Tentar usar o método do scribd.vdownloaders.com
                if doc_id:
                    try:
                        # Construir URL do vdownloaders
                        vdownloader_url = url.replace('scribd.com', 'scribd.vdownloaders.com')
                        
                        # Navegar para o vdownloader
                        await page.goto(vdownloader_url, wait_until='networkidle')
                        await page.wait_for_timeout(3000)
                        
                        # Procurar por links de download
                        download_links = await page.query_selector_all('a[href*=".pdf"], a[href*="download"]')
                        
                        for link in download_links:
                            href = await link.get_attribute('href')
                            if href and '.pdf' in href.lower():
                                if not href.startswith('http'):
                                    href = urljoin(vdownloader_url, href)
                                
                                response = self.session.get(href, stream=True)
                                if response.status_code == 200:
                                    filename = f"scribd_{doc_id}.pdf"
                                    filepath = os.path.join(self.temp_dir, filename)
                                    
                                    with open(filepath, 'wb') as f:
                                        for chunk in response.iter_content(chunk_size=8192):
                                            f.write(chunk)
                                    
                                    await browser.close()
                                    return filepath, filename
                    except:
                        pass
                
                # Voltar para a página original do Scribd
                await page.goto(url, wait_until='networkidle')
                await page.wait_for_timeout(3000)
                
                # Procurar por botões de download na página original
                download_selectors = [
                    'button[data-testid*="download"]',
                    'a[href*="download"]',
                    '.download_button',
                    '.btn-download',
                    'button:has-text("Download")',
                    'a:has-text("Download")'
                ]
                
                for selector in download_selectors:
                    try:
                        elements = await page.query_selector_all(selector)
                        for element in elements:
                            await element.click()
                            await page.wait_for_timeout(2000)
                            
                            # Verificar se apareceu algum link de download
                            pdf_links = await page.query_selector_all('a[href*=".pdf"]')
                            for link in pdf_links:
                                href = await link.get_attribute('href')
                                if href and '.pdf' in href.lower():
                                    if not href.startswith('http'):
                                        href = urljoin(url, href)
                                    
                                    response = self.session.get(href, stream=True)
                                    if response.status_code == 200:
                                        filename = f"scribd_{doc_id or int(time.time())}.pdf"
                                        filepath = os.path.join(self.temp_dir, filename)
                                        
                                        with open(filepath, 'wb') as f:
                                            for chunk in response.iter_content(chunk_size=8192):
                                                f.write(chunk)
                                        
                                        await browser.close()
                                        return filepath, filename
                    except:
                        continue
                
                # Tentar extrair imagens das páginas (método do scribd-downloader)
                try:
                    # Procurar por imagens das páginas
                    page_images = await page.query_selector_all('img[src*="page"], img[src*="document"]')
                    
                    if page_images:
                        # Se encontrou imagens, baixar e converter para PDF
                        from PIL import Image
                        import io
                        
                        images = []
                        for i, img_element in enumerate(page_images[:50]):  # Limitar a 50 páginas
                            try:
                                img_src = await img_element.get_attribute('src')
                                if img_src:
                                    if not img_src.startswith('http'):
                                        img_src = urljoin(url, img_src)
                                    
                                    img_response = self.session.get(img_src)
                                    if img_response.status_code == 200:
                                        img = Image.open(io.BytesIO(img_response.content))
                                        if img.mode != 'RGB':
                                            img = img.convert('RGB')
                                        images.append(img)
                            except:
                                continue
                        
                        if images:
                            filename = f"scribd_{doc_id or int(time.time())}.pdf"
                            filepath = os.path.join(self.temp_dir, filename)
                            
                            # Salvar como PDF
                            images[0].save(filepath, save_all=True, append_images=images[1:])
                            
                            await browser.close()
                            return filepath, filename
                except:
                    pass
                
                # Como último recurso, gerar PDF da página
                filename = f"scribd_page_{int(time.time())}.pdf"
                filepath = os.path.join(self.temp_dir, filename)
                
                await page.pdf(path=filepath, format='A4', print_background=True)
                await browser.close()
                
                return filepath, filename
                
        except Exception as e:
            return None, str(e)
    
    async def download_from_generic_site_advanced(self, url):
        """Método avançado para baixar PDFs de sites genéricos"""
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                # Configurar user agent
                await page.set_extra_http_headers({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                })
                
                # Navegar para a página
                await page.goto(url, wait_until='networkidle')
                await page.wait_for_timeout(3000)
                
                # Procurar por links diretos para PDF
                pdf_selectors = [
                    'a[href$=".pdf"]',
                    'a[href*=".pdf"]',
                    'a[href*="download"]',
                    'a[href*="pdf"]',
                    'embed[src$=".pdf"]',
                    'iframe[src$=".pdf"]',
                    'object[data$=".pdf"]'
                ]
                
                for selector in pdf_selectors:
                    elements = await page.query_selector_all(selector)
                    for element in elements:
                        href = await element.get_attribute('href') or await element.get_attribute('src') or await element.get_attribute('data')
                        if href and '.pdf' in href.lower():
                            if not href.startswith('http'):
                                href = urljoin(url, href)
                            
                            response = self.session.get(href, stream=True)
                            if response.status_code == 200 and 'application/pdf' in response.headers.get('content-type', ''):
                                filename = f"download_{int(time.time())}.pdf"
                                filepath = os.path.join(self.temp_dir, filename)
                                
                                with open(filepath, 'wb') as f:
                                    for chunk in response.iter_content(chunk_size=8192):
                                        f.write(chunk)
                                
                                await browser.close()
                                return filepath, filename
                
                # Se não encontrou PDF direto, tentar imprimir a página como PDF
                filename = f"webpage_{int(time.time())}.pdf"
                filepath = os.path.join(self.temp_dir, filename)
                
                await page.pdf(path=filepath, format='A4', print_background=True)
                await browser.close()
                
                return filepath, filename
                
        except Exception as e:
            return None, str(e)

@advanced_pdf_bp.route('/download-advanced', methods=['POST'])
def download_pdf_advanced():
    """Endpoint avançado para baixar PDFs"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL é obrigatória'}), 400
        
        # Validar URL
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            return jsonify({'error': 'URL inválida'}), 400
        
        downloader = AdvancedPDFDownloader()
        
        # Determinar o tipo de site e usar o método apropriado
        if 'slideshare' in url.lower():
            filepath, filename = asyncio.run(downloader.download_from_slideshare_advanced(url))
        elif 'scribd' in url.lower():
            filepath, filename = asyncio.run(downloader.download_from_scribd_advanced(url))
        else:
            filepath, filename = asyncio.run(downloader.download_from_generic_site_advanced(url))
        
        if filepath and os.path.exists(filepath):
            return send_file(
                filepath,
                as_attachment=True,
                download_name=filename,
                mimetype='application/pdf'
            )
        else:
            return jsonify({'error': f'Erro ao baixar PDF: {filename}'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@advanced_pdf_bp.route('/status-advanced', methods=['GET'])
def status_advanced():
    """Endpoint para verificar o status do serviço avançado"""
    return jsonify({
        'status': 'online',
        'message': 'Serviço avançado de download de PDF funcionando',
        'features': [
            'Download direto de PDFs originais do SlideShare',
            'Download de documentos originais do Scribd',
            'Extração de PDFs de sites genéricos',
            'Conversão de páginas em PDF como fallback'
        ]
    })


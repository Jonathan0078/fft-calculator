from flask import Blueprint, request, jsonify, send_file
import os
import tempfile
import asyncio
from playwright.async_api import async_playwright
import requests
from urllib.parse import urlparse, urljoin
import re
import time

pdf_bp = Blueprint('pdf', __name__)

class PDFDownloader:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
    
    async def download_from_slideshare(self, url):
        """Baixa PDF do SlideShare usando Playwright"""
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                # Navegar para a página
                await page.goto(url, wait_until='networkidle')
                
                # Aguardar o carregamento da página
                await page.wait_for_timeout(3000)
                
                # Procurar por links de download direto
                download_links = await page.query_selector_all('a[href*=".pdf"], a[href*="download"]')
                
                for link in download_links:
                    href = await link.get_attribute('href')
                    if href and ('.pdf' in href.lower() or 'download' in href.lower()):
                        # Tentar baixar o arquivo
                        if not href.startswith('http'):
                            href = urljoin(url, href)
                        
                        response = requests.get(href, stream=True)
                        if response.status_code == 200 and 'application/pdf' in response.headers.get('content-type', ''):
                            filename = f"slideshare_{int(time.time())}.pdf"
                            filepath = os.path.join(self.temp_dir, filename)
                            
                            with open(filepath, 'wb') as f:
                                for chunk in response.iter_content(chunk_size=8192):
                                    f.write(chunk)
                            
                            await browser.close()
                            return filepath, filename
                
                # Se não encontrou link direto, tentar imprimir como PDF
                filename = f"slideshare_{int(time.time())}.pdf"
                filepath = os.path.join(self.temp_dir, filename)
                
                await page.pdf(path=filepath, format='A4')
                await browser.close()
                
                return filepath, filename
                
        except Exception as e:
            return None, str(e)
    
    async def download_from_scribd(self, url):
        """Baixa PDF do Scribd usando Playwright"""
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                # Navegar para a página
                await page.goto(url, wait_until='networkidle')
                
                # Aguardar o carregamento da página
                await page.wait_for_timeout(5000)
                
                # Procurar por botões de download
                download_buttons = await page.query_selector_all('button[data-testid*="download"], a[href*="download"], .download_button')
                
                for button in download_buttons:
                    try:
                        await button.click()
                        await page.wait_for_timeout(2000)
                        
                        # Verificar se apareceu algum link de download
                        pdf_links = await page.query_selector_all('a[href*=".pdf"]')
                        for link in pdf_links:
                            href = await link.get_attribute('href')
                            if href and '.pdf' in href.lower():
                                if not href.startswith('http'):
                                    href = urljoin(url, href)
                                
                                response = requests.get(href, stream=True)
                                if response.status_code == 200:
                                    filename = f"scribd_{int(time.time())}.pdf"
                                    filepath = os.path.join(self.temp_dir, filename)
                                    
                                    with open(filepath, 'wb') as f:
                                        for chunk in response.iter_content(chunk_size=8192):
                                            f.write(chunk)
                                    
                                    await browser.close()
                                    return filepath, filename
                    except:
                        continue
                
                # Se não conseguiu baixar, tentar imprimir como PDF
                filename = f"scribd_{int(time.time())}.pdf"
                filepath = os.path.join(self.temp_dir, filename)
                
                await page.pdf(path=filepath, format='A4')
                await browser.close()
                
                return filepath, filename
                
        except Exception as e:
            return None, str(e)
    
    async def download_from_generic_site(self, url):
        """Baixa PDF de sites genéricos"""
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                # Navegar para a página
                await page.goto(url, wait_until='networkidle')
                
                # Aguardar o carregamento da página
                await page.wait_for_timeout(3000)
                
                # Procurar por links diretos para PDF
                pdf_links = await page.query_selector_all('a[href*=".pdf"], a[href*="download"]')
                
                for link in pdf_links:
                    href = await link.get_attribute('href')
                    if href and '.pdf' in href.lower():
                        if not href.startswith('http'):
                            href = urljoin(url, href)
                        
                        response = requests.get(href, stream=True)
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
                
                await page.pdf(path=filepath, format='A4')
                await browser.close()
                
                return filepath, filename
                
        except Exception as e:
            return None, str(e)

@pdf_bp.route('/download', methods=['POST'])
def download_pdf():
    """Endpoint para baixar PDFs"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL é obrigatória'}), 400
        
        # Validar URL
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            return jsonify({'error': 'URL inválida'}), 400
        
        downloader = PDFDownloader()
        
        # Determinar o tipo de site e usar o método apropriado
        if 'slideshare' in url.lower():
            filepath, filename = asyncio.run(downloader.download_from_slideshare(url))
        elif 'scribd' in url.lower():
            filepath, filename = asyncio.run(downloader.download_from_scribd(url))
        else:
            filepath, filename = asyncio.run(downloader.download_from_generic_site(url))
        
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

@pdf_bp.route('/status', methods=['GET'])
def status():
    """Endpoint para verificar o status do serviço"""
    return jsonify({
        'status': 'online',
        'message': 'Serviço de download de PDF funcionando'
    })


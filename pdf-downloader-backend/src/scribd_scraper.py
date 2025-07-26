#!/usr/bin/env python3
"""
Scribd Web Scraper usando Playwright
Este script baixa documentos do Scribd convertendo-os em PDF.
"""

import asyncio
import os
import re
import tempfile
import time
from pathlib import Path
from typing import Optional

from playwright.async_api import async_playwright, Page, Browser
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from PIL import Image
import io


class ScribdScraper:
    def __init__(self, headless: bool = True, timeout: int = 30000):
        """
        Inicializa o scraper do Scribd.
        
        Args:
            headless: Se deve executar o navegador em modo headless
            timeout: Timeout em milissegundos para operações de página
        """
        self.headless = headless
        self.timeout = timeout
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None

    async def __aenter__(self):
        """Context manager entry."""
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        await self.close()

    async def start(self):
        """Inicia o navegador e a página."""
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=self.headless,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        )
        self.page = await self.browser.new_page()
        await self.page.set_viewport_size({"width": 1200, "height": 800})

    async def close(self):
        """Fecha o navegador."""
        if self.page:
            await self.page.close()
        if self.browser:
            await self.browser.close()
        if hasattr(self, 'playwright'):
            await self.playwright.stop()

    def extract_document_id(self, url: str) -> Optional[str]:
        """
        Extrai o ID do documento da URL do Scribd.
        
        Args:
            url: URL do documento do Scribd
            
        Returns:
            ID do documento ou None se não encontrado
        """
        # Padrões de URL do Scribd
        patterns = [
            r'scribd\.com/document/(\d+)',
            r'scribd\.com/doc/(\d+)',
            r'scribd\.com/presentation/(\d+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None

    async def navigate_to_document(self, url: str) -> bool:
        """
        Navega para o documento do Scribd.
        
        Args:
            url: URL do documento
            
        Returns:
            True se a navegação foi bem-sucedida
        """
        try:
            # Navegar para a URL
            await self.page.goto(url, wait_until='networkidle', timeout=self.timeout)
            
            # Aguardar o carregamento do documento
            await self.page.wait_for_timeout(3000)
            
            # Verificar se a página carregou corretamente
            title = await self.page.title()
            if "scribd" not in title.lower():
                print(f"Aviso: Título da página não contém 'scribd': {title}")
            
            return True
            
        except Exception as e:
            print(f"Erro ao navegar para o documento: {e}")
            return False

    async def scroll_and_load_content(self) -> bool:
        """
        Rola a página para carregar todo o conteúdo do documento.
        
        Returns:
            True se o conteúdo foi carregado com sucesso
        """
        try:
            # Aguardar o carregamento inicial
            await self.page.wait_for_timeout(2000)
            
            # Tentar encontrar o container do documento
            document_selectors = [
                '.document_scroller',
                '.outer_page_container',
                '[data-testid="document-container"]',
                '.page_container',
                '.document-container'
            ]
            
            container = None
            for selector in document_selectors:
                try:
                    container = await self.page.query_selector(selector)
                    if container:
                        print(f"Container encontrado: {selector}")
                        break
                except:
                    continue
            
            if not container:
                print("Container do documento não encontrado, tentando rolar a página principal")
                # Rolar a página principal se não encontrar container específico
                for i in range(10):
                    await self.page.keyboard.press('PageDown')
                    await self.page.wait_for_timeout(1000)
                return True
            
            # Rolar dentro do container do documento
            previous_height = 0
            current_height = await container.evaluate('el => el.scrollHeight')
            
            while current_height > previous_height:
                previous_height = current_height
                
                # Rolar para baixo
                await container.evaluate('el => el.scrollTop = el.scrollHeight')
                await self.page.wait_for_timeout(2000)
                
                # Verificar nova altura
                current_height = await container.evaluate('el => el.scrollHeight')
                
                # Pressionar Page Down para garantir que todo o conteúdo seja carregado
                await self.page.keyboard.press('PageDown')
                await self.page.wait_for_timeout(1000)
            
            print("Conteúdo carregado completamente")
            return True
            
        except Exception as e:
            print(f"Erro ao carregar conteúdo: {e}")
            return False

    async def capture_document_as_pdf(self, output_path: str) -> bool:
        """
        Captura o documento como PDF.
        
        Args:
            output_path: Caminho para salvar o PDF
            
        Returns:
            True se o PDF foi gerado com sucesso
        """
        try:
            # Aguardar um pouco para garantir que tudo está carregado
            await self.page.wait_for_timeout(3000)
            
            # Tentar gerar PDF diretamente da página
            pdf_bytes = await self.page.pdf(
                path=output_path,
                format='A4',
                print_background=True,
                margin={
                    'top': '1cm',
                    'right': '1cm',
                    'bottom': '1cm',
                    'left': '1cm'
                }
            )
            
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                print(f"PDF gerado com sucesso: {output_path}")
                return True
            else:
                print("PDF gerado mas arquivo está vazio ou não existe")
                return False
                
        except Exception as e:
            print(f"Erro ao gerar PDF: {e}")
            return False

    async def download_document(self, url: str, output_path: str) -> bool:
        """
        Baixa um documento do Scribd como PDF.
        
        Args:
            url: URL do documento do Scribd
            output_path: Caminho para salvar o PDF
            
        Returns:
            True se o download foi bem-sucedido
        """
        try:
            # Extrair ID do documento
            doc_id = self.extract_document_id(url)
            if not doc_id:
                print(f"Não foi possível extrair ID do documento da URL: {url}")
                return False
            
            print(f"ID do documento extraído: {doc_id}")
            
            # Navegar para o documento
            if not await self.navigate_to_document(url):
                return False
            
            # Carregar todo o conteúdo
            if not await self.scroll_and_load_content():
                return False
            
            # Capturar como PDF
            if not await self.capture_document_as_pdf(output_path):
                return False
            
            return True
            
        except Exception as e:
            print(f"Erro durante o download: {e}")
            return False


async def download_scribd_document(url: str, output_path: str, headless: bool = True) -> bool:
    """
    Função principal para baixar um documento do Scribd.
    
    Args:
        url: URL do documento do Scribd
        output_path: Caminho para salvar o PDF
        headless: Se deve executar em modo headless
        
    Returns:
        True se o download foi bem-sucedido
    """
    async with ScribdScraper(headless=headless) as scraper:
        return await scraper.download_document(url, output_path)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Uso: python scribd_scraper.py <URL_DO_SCRIBD> <CAMINHO_DO_PDF>")
        sys.exit(1)
    
    url = sys.argv[1]
    output_path = sys.argv[2]
    
    # Executar o download
    success = asyncio.run(download_scribd_document(url, output_path))
    
    if success:
        print(f"Download concluído com sucesso: {output_path}")
        sys.exit(0)
    else:
        print("Falha no download")
        sys.exit(1)


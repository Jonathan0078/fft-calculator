#!/usr/bin/env python3
\"\"\"
Scribd Web Scraper usando Playwright
Este script baixa documentos do Scribd convertendo-os em PDF.
\"\"\"

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
        \"\"\"
        Inicializa o scraper do Scribd.
        
        Args:
            headless: Se deve executar o navegador em modo headless
            timeout: Timeout em milissegundos para operações de página
        \"\"\"
        self.headless = headless
        self.timeout = timeout
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None

    async def __aenter__(self):
        \"\"\"Context manager entry.\"\"\"
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        \"\"\"Context manager exit.\"\"\"
        await self.close()

    async def start(self):
        \"\"\"Inicia o navegador e a página.\"\"\"
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=self.headless,
            args=[
                \"--no-sandbox\",
                \"--disable-setuid-sandbox\",
                \"--disable-dev-shm-usage\",
                \"--disable-accelerated-2d-canvas\",
                \"--no-first-run\",
                \"--no-zygote\",
                \"--disable-gpu\"
            ]
        )
        self.page = await self.browser.new_page()
        await self.page.set_viewport_size({\"width\": 1200, \"height\": 800})

    async def close(self):
        \"\"\"Fecha o navegador.\"\"\"
        if self.page:
            await self.page.close()
        if self.browser:
            await self.browser.close()
        if hasattr(self, \"playwright\"): 
            await self.playwright.stop()

    def extract_document_id(self, url: str) -> Optional[str]:
        \"\"\"
        Extrai o ID do documento da URL do Scribd.
        
        Args:
            url: URL do documento do Scribd
            
        Returns:
            ID do documento ou None se não encontrado
        \"\"\"
        # Padrões de URL do Scribd
        patterns = [
            r\"scribd\\.com/document/(\\d+)\",
            r\"scribd\\.com/doc/(\\d+)\",
            r\"scribd\\.com/presentation/(\\d+)\"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None

    async def navigate_to_document(self, url: str) -> bool:
        \"\"\"
        Navega para o documento do Scribd.
        
        Args:
            url: URL do documento
            
        Returns:
            True se a navegação foi bem-sucedida
        \"\"\"
        try:
            # Navegar para a URL
            await self.page.goto(url, wait_until=\'networkidle\', timeout=self.timeout)
            
            # Aguardar o carregamento do documento
            await self.page.wait_for_timeout(3000)
            
            # Verificar se a página carregou corretamente
            title = await self.page.title()
            if \"scribd\" not in title.lower():
                print(f\"Aviso: Título da página não contém \'scribd\': {title}\")
            
            return True
            
        except Exception as e:
            print(f\"Erro ao navegar para o documento: {e}\")
            return False

    async def scroll_and_load_content(self) -> bool:
        \"\"\"
        Rola a página para carregar todo o conteúdo do documento.
        
        Returns:
            True se o conteúdo foi carregado com sucesso
        \"\"\"
        try:
            # Aguardar o carregamento inicial
            await self.page.wait_for_timeout(2000)
            
            # Tentar encontrar o container do documento
            document_selectors = [
                \".document_scroller\",
                \".outer_page_container\",
                \"[data-testid=\\\"document-container\\\"]\",
                \".page_container\",

#!/usr/bin/env python3
"""
Software para Download de PDFs
Desenvolvido para baixar PDFs do Scribd e acessar conteúdo de domínio público
"""

import requests
import re
import os
import sys
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import time

class PDFDownloader:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def download_from_scribd_via_service(self, scribd_url, output_dir="downloads"):
        """
        Baixa PDFs do Scribd usando serviços de terceiros
        """
        print(f"Tentando baixar: {scribd_url}")
        
        # Verifica se a URL é válida do Scribd
        if not self.is_valid_scribd_url(scribd_url):
            print("URL do Scribd inválida!")
            return False
            
        # Cria diretório de download se não existir
        os.makedirs(output_dir, exist_ok=True)
        
        # Lista de serviços de terceiros para tentar
        services = [
            "https://scribd.vdownloaders.com",
            "https://scribd.downloader.tips",
            "https://docdownloader.com"
        ]
        
        for service in services:
            try:
                print(f"Tentando com o serviço: {service}")
                success = self._try_service(service, scribd_url, output_dir)
                if success:
                    return True
            except Exception as e:
                print(f"Erro com o serviço {service}: {e}")
                continue
                
        print("Não foi possível baixar o arquivo com nenhum serviço.")
        return False
    
    def is_valid_scribd_url(self, url):
        """
        Verifica se a URL é válida do Scribd
        """
        valid_patterns = [
            r'https://www\.scribd\.com/document/',
            r'https://www\.scribd\.com/doc/',
            r'https://www\.scribd\.com/presentation/'
        ]
        
        for pattern in valid_patterns:
            if re.match(pattern, url):
                return True
        return False
    
    def _try_service(self, service_url, scribd_url, output_dir):
        """
        Tenta baixar usando um serviço específico
        """
        try:
            # Para o scribd.vdownloaders.com
            if "vdownloaders.com" in service_url:
                return self._download_via_vdownloaders(scribd_url, output_dir)
            
            # Para outros serviços, implementar conforme necessário
            return False
            
        except Exception as e:
            print(f"Erro ao tentar serviço: {e}")
            return False
    
    def _download_via_vdownloaders(self, scribd_url, output_dir):
        """
        Baixa usando o serviço vdownloaders.com
        """
        try:
            # Substitui o domínio do Scribd pelo do vdownloaders
            download_url = scribd_url.replace("www.scribd.com", "scribd.vdownloaders.com")
            
            print(f"Acessando: {download_url}")
            response = self.session.get(download_url, timeout=30)
            
            if response.status_code == 200:
                # Procura por links de download na página
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Procura por links de PDF
                pdf_links = soup.find_all('a', href=re.compile(r'\.pdf$', re.I))
                
                if pdf_links:
                    pdf_url = pdf_links[0]['href']
                    if not pdf_url.startswith('http'):
                        pdf_url = urljoin(download_url, pdf_url)
                    
                    return self._download_file(pdf_url, output_dir)
                else:
                    print("Nenhum link de PDF encontrado na página.")
                    return False
            else:
                print(f"Erro ao acessar o serviço: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Erro no download via vdownloaders: {e}")
            return False
    
    def _download_file(self, file_url, output_dir):
        """
        Baixa o arquivo PDF
        """
        try:
            print(f"Baixando arquivo de: {file_url}")
            response = self.session.get(file_url, stream=True, timeout=60)
            
            if response.status_code == 200:
                # Extrai o nome do arquivo da URL ou usa um nome padrão
                filename = self._extract_filename(file_url, response)
                filepath = os.path.join(output_dir, filename)
                
                # Baixa o arquivo
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                
                print(f"Arquivo baixado com sucesso: {filepath}")
                return True
            else:
                print(f"Erro ao baixar arquivo: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Erro no download do arquivo: {e}")
            return False
    
    def _extract_filename(self, url, response):
        """
        Extrai o nome do arquivo da URL ou headers
        """
        # Tenta extrair do header Content-Disposition
        content_disposition = response.headers.get('Content-Disposition', '')
        if 'filename=' in content_disposition:
            filename = content_disposition.split('filename=')[1].strip('"')
            return filename
        
        # Tenta extrair da URL
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)
        
        if filename and filename.endswith('.pdf'):
            return filename
        
        # Nome padrão
        return f"documento_{int(time.time())}.pdf"
    
    def search_public_domain_books(self, query, max_results=10):
        """
        Busca livros em domínio público
        """
        print(f"Buscando livros em domínio público: {query}")
        
        # URLs de bibliotecas digitais gratuitas
        sources = [
            "http://www.dominiopublico.gov.br/",
            "https://www.gutenberg.org/",
            "https://www.baixelivros.com.br/"
        ]
        
        results = []
        
        for source in sources:
            try:
                print(f"Buscando em: {source}")
                # Implementar busca específica para cada fonte
                # Por enquanto, retorna informações básicas
                results.append({
                    'source': source,
                    'query': query,
                    'message': 'Acesse manualmente para buscar livros'
                })
            except Exception as e:
                print(f"Erro ao buscar em {source}: {e}")
        
        return results

def main():
    """
    Função principal do programa
    """
    print("=== Software de Download de PDFs ===")
    print("Desenvolvido para Scribd e conteúdo de domínio público")
    print()
    
    downloader = PDFDownloader()
    
    while True:
        print("\nOpções:")
        print("1. Baixar PDF do Scribd")
        print("2. Buscar livros em domínio público")
        print("3. Sair")
        
        choice = input("\nEscolha uma opção (1-3): ").strip()
        
        if choice == '1':
            url = input("Digite a URL do Scribd: ").strip()
            if url:
                output_dir = input("Diretório de saída (padrão: downloads): ").strip() or "downloads"
                downloader.download_from_scribd_via_service(url, output_dir)
            else:
                print("URL inválida!")
        
        elif choice == '2':
            query = input("Digite o termo de busca: ").strip()
            if query:
                results = downloader.search_public_domain_books(query)
                print("\nResultados encontrados:")
                for result in results:
                    print(f"- {result['source']}: {result['message']}")
            else:
                print("Termo de busca inválido!")
        
        elif choice == '3':
            print("Saindo...")
            break
        
        else:
            print("Opção inválida!")

if __name__ == "__main__":
    main()


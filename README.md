# Software de Download de PDFs

Este software foi desenvolvido para auxiliar no download de PDFs do Scribd e no acesso a conteúdo de domínio público.

## ⚠️ Aviso Legal

**IMPORTANTE**: Este software foi desenvolvido apenas para fins educacionais e de pesquisa. O uso deste software deve respeitar:

- Os termos de serviço das plataformas
- As leis de direitos autorais
- A propriedade intelectual dos autores

O desenvolvedor não se responsabiliza pelo uso inadequado desta ferramenta.

## Funcionalidades

### 1. Download do Scribd
- Tenta baixar documentos do Scribd usando serviços de terceiros
- Suporte para URLs dos tipos:
  - `https://www.scribd.com/document/`
  - `https://www.scribd.com/doc/`
  - `https://www.scribd.com/presentation/`

### 2. Busca de Livros em Domínio Público
- Fornece links para bibliotecas digitais gratuitas
- Acesso a conteúdo de domínio público
- Fontes incluem:
  - Domínio Público (gov.br)
  - Project Gutenberg
  - Baixe Livros

## Instalação

### Pré-requisitos
```bash
pip3 install requests beautifulsoup4 lxml
```

### Como usar

1. **Executar o programa**:
```bash
python3 pdf_downloader.py
```

2. **Opções disponíveis**:
   - Opção 1: Baixar PDF do Scribd
   - Opção 2: Buscar livros em domínio público
   - Opção 3: Sair

### Exemplo de uso

```python
from pdf_downloader import PDFDownloader

# Criar instância do downloader
downloader = PDFDownloader()

# Tentar baixar do Scribd
url = "https://www.scribd.com/document/123456/exemplo"
resultado = downloader.download_from_scribd_via_service(url, "downloads")

# Buscar livros em domínio público
resultados = downloader.search_public_domain_books("python programming")
```

## Limitações

### Scribd
- Os serviços de terceiros podem não funcionar sempre
- Alguns documentos podem estar protegidos
- A disponibilidade dos serviços externos não é garantida

### Sites de Livros Comerciais
- O software não inclui funcionalidades para download de conteúdo pago
- Recomenda-se o acesso apenas a conteúdo gratuito ou de domínio público

## Estrutura do Código

```
pdf_downloader.py
├── PDFDownloader (classe principal)
├── download_from_scribd_via_service() - Download do Scribd
├── search_public_domain_books() - Busca em domínio público
├── is_valid_scribd_url() - Validação de URLs
└── main() - Interface de linha de comando
```

## Fontes de Conteúdo Gratuito

### Bibliotecas Digitais Recomendadas:
1. **Domínio Público** - http://www.dominiopublico.gov.br/
2. **Project Gutenberg** - https://www.gutenberg.org/
3. **Baixe Livros** - https://www.baixelivros.com.br/
4. **Google Books** - https://books.google.com.br/
5. **Internet Archive** - https://archive.org/

## Considerações Éticas

Este software foi desenvolvido com foco em:
- Acesso a conteúdo educacional
- Preservação de conhecimento em domínio público
- Respeito aos direitos autorais
- Uso responsável da tecnologia

## Suporte

Para questões técnicas ou melhorias, consulte a documentação do código ou entre em contato com o desenvolvedor.

## Licença

Este software é fornecido "como está" para fins educacionais. Use com responsabilidade e respeite as leis aplicáveis.


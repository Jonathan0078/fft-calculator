# PDF Downloader - Software para Baixar PDFs da Internet

## 📄 Descrição

O PDF Downloader é uma aplicação web desenvolvida para baixar PDFs de sites como SlideShare, Scribd e outros sites da internet de forma fácil e rápida. O software utiliza técnicas avançadas de web scraping e automação para extrair os documentos originais sempre que possível.

## ✨ Funcionalidades

### 🎯 Funcionalidades Principais
- **Download direto de PDFs originais do SlideShare**
- **Download de documentos originais do Scribd**
- **Extração de PDFs de sites genéricos**
- **Conversão de páginas em PDF como fallback**
- **Interface web intuitiva e responsiva**
- **Suporte a múltiplos formatos de URL**

### 🌐 Sites Suportados
- **SlideShare** (slideshare.net)
- **Scribd** (scribd.com)
- **Sites genéricos** com PDFs incorporados
- **Páginas web** (conversão para PDF)

## 🚀 Instalação e Configuração

### Pré-requisitos
- Python 3.11+
- pip (gerenciador de pacotes Python)
- Navegadores para Playwright (instalados automaticamente)

### Passos de Instalação

1. **Clone ou baixe o projeto**
   ```bash
   # Se você tem o código em um repositório
   git clone <url-do-repositorio>
   cd pdf_downloader
   ```

2. **Ative o ambiente virtual**
   ```bash
   source venv/bin/activate
   ```

3. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

4. **Instale os navegadores do Playwright**
   ```bash
   playwright install
   ```

5. **Inicie o servidor**
   ```bash
   python src/main.py
   ```

6. **Acesse a aplicação**
   - Abra seu navegador e vá para: `http://localhost:5000`

## 📖 Como Usar

### Interface Web

1. **Acesse a aplicação** em `http://localhost:5000`
2. **Cole a URL** do documento que deseja baixar no campo de entrada
3. **Clique em "Baixar PDF"** e aguarde o processamento
4. **O download** será iniciado automaticamente quando concluído

### Exemplos de URLs Suportadas

```
# SlideShare
https://www.slideshare.net/exemplo/apresentacao-123456

# Scribd
https://www.scribd.com/document/123456/documento-exemplo
https://www.scribd.com/doc/123456/documento-exemplo
https://www.scribd.com/presentation/123456/apresentacao-exemplo

# Sites genéricos
https://exemplo.com/documento.pdf
https://site.com/pagina-com-pdf-incorporado
```

## 🔧 API Endpoints

### Endpoint Principal (Avançado)
```
POST /api/advanced/download-advanced
Content-Type: application/json

{
    "url": "https://www.slideshare.net/exemplo/apresentacao"
}
```

### Verificação de Status
```
GET /api/advanced/status-advanced
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask** - Framework web Python
- **Playwright** - Automação de navegador
- **Requests** - Cliente HTTP
- **BeautifulSoup** - Parser HTML
- **Pillow** - Manipulação de imagens

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização responsiva
- **JavaScript** - Interatividade

### Dependências Principais
```
flask==3.1.1
flask-cors==6.0.0
playwright==1.54.0
requests==2.32.4
beautifulsoup4==4.13.4
Pillow==11.3.0
pypdf==5.9.0
```

## 📁 Estrutura do Projeto

```
pdf_downloader/
├── src/
│   ├── main.py                          # Arquivo principal da aplicação
│   ├── models/                          # Modelos de dados
│   ├── routes/
│   │   ├── pdf_downloader.py           # Rotas básicas
│   │   ├── advanced_pdf_downloader.py  # Rotas avançadas
│   │   └── user.py                     # Rotas de usuário
│   ├── static/
│   │   └── index.html                  # Interface web
│   └── database/                       # Banco de dados SQLite
├── venv/                               # Ambiente virtual Python
├── requirements.txt                    # Dependências
├── server.log                         # Logs do servidor
└── README.md                          # Esta documentação
```

## ⚖️ Considerações Legais

### ⚠️ Aviso Importante
Este software é destinado **apenas** para baixar conteúdo que você tem **direito legal** de acessar. 

### Diretrizes de Uso
- ✅ **Permitido**: Baixar documentos públicos e gratuitos
- ✅ **Permitido**: Baixar conteúdo que você possui ou tem licença
- ✅ **Permitido**: Uso educacional e pessoal respeitando direitos autorais
- ❌ **Proibido**: Baixar conteúdo pago de forma ilegal
- ❌ **Proibido**: Violar termos de serviço dos sites
- ❌ **Proibido**: Distribuir conteúdo protegido por direitos autorais

### Responsabilidade
O usuário é **totalmente responsável** pelo uso do software e deve:
- Respeitar os direitos autorais
- Cumprir os termos de serviço dos sites
- Usar apenas para fins legítimos

## 🔍 Como Funciona

### Métodos de Extração

1. **Download Direto**
   - Procura por links diretos para PDFs na página
   - Extrai URLs de download dos metadados da página

2. **API Externa**
   - Utiliza APIs públicas quando disponíveis
   - Integração com serviços de terceiros

3. **Extração de Imagens**
   - Para documentos baseados em imagens
   - Converte sequência de imagens em PDF

4. **Conversão de Página**
   - Como último recurso
   - Gera PDF da página web visualizada

### Fluxo de Processamento

```
URL de Entrada
    ↓
Identificação do Site
    ↓
Método Específico de Extração
    ↓
Validação do Conteúdo
    ↓
Download do Arquivo
    ↓
Entrega ao Usuário
```

## 🐛 Solução de Problemas

### Problemas Comuns

**Erro: "URL inválida"**
- Verifique se a URL está completa e correta
- Certifique-se de que o site é suportado

**Erro: "Falha no download"**
- O documento pode estar protegido
- Verifique sua conexão com a internet
- Tente novamente após alguns minutos

**Erro: "Serviço indisponível"**
- Reinicie o servidor: `python src/main.py`
- Verifique se todas as dependências estão instaladas

### Logs e Depuração

- Logs do servidor: `tail -f server.log`
- Console do navegador: F12 → Console
- Status da API: `curl http://localhost:5000/api/advanced/status-advanced`

## 🔄 Atualizações e Melhorias

### Versão Atual: 1.0
- ✅ Suporte básico ao SlideShare
- ✅ Suporte básico ao Scribd
- ✅ Interface web responsiva
- ✅ Múltiplos métodos de extração

### Próximas Versões
- 🔄 Suporte a mais sites
- 🔄 Cache de downloads
- 🔄 Processamento em lote
- 🔄 API REST completa

## 📞 Suporte

Para problemas, sugestões ou dúvidas:
1. Verifique a seção de solução de problemas
2. Consulte os logs de erro
3. Teste com diferentes URLs

## 📄 Licença

Este projeto é fornecido "como está" para fins educacionais e de pesquisa. O uso deve estar em conformidade com as leis locais e termos de serviço dos sites acessados.

---

**Desenvolvido com ❤️ para facilitar o acesso legal a documentos públicos**


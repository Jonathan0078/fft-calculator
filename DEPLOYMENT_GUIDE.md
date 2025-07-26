# Guia de Implantação - PDF Downloader Web

## 📋 Visão Geral

Este projeto é uma aplicação web completa para download de PDFs do Scribd e busca de livros em domínio público. A aplicação inclui:

- **Frontend**: Interface moderna e responsiva (HTML, CSS, JavaScript)
- **Backend**: API Flask com endpoints para download e busca
- **Funcionalidades**: Download do Scribd, busca em domínio público, interface intuitiva

## 🚀 Como Executar Localmente

### Pré-requisitos
- Python 3.11+
- Git

### Passos para Execução

1. **Clone o repositório:**
```bash
git clone https://github.com/Jonathan0078/pdf-downloader-web.git
cd pdf-downloader-web
```

2. **Navegue para o diretório da aplicação Flask:**
```bash
cd pdf-downloader-backend
```

3. **Ative o ambiente virtual:**
```bash
source venv/bin/activate
```

4. **Execute o servidor:**
```bash
python run_server.py
```

5. **Acesse a aplicação:**
Abra seu navegador e vá para: `http://localhost:5001`

## 🌐 Implantação em Produção

### Opção 1: Deploy Automático (Recomendado)

Para fazer deploy da aplicação em produção, você pode usar o sistema de deploy integrado:

```bash
# No diretório pdf-downloader-backend
python -c "
from manus_deploy import deploy_flask_app
url = deploy_flask_app('.')
print(f'Aplicação disponível em: {url}')
"
```

### Opção 2: Serviços de Cloud

#### Heroku
1. Instale o Heroku CLI
2. Crie um novo app: `heroku create seu-app-name`
3. Configure as variáveis de ambiente
4. Faça deploy: `git push heroku master`

#### Railway
1. Conecte seu repositório GitHub ao Railway
2. Configure as variáveis de ambiente
3. Deploy automático será feito

#### Render
1. Conecte seu repositório GitHub ao Render
2. Configure o comando de build: `pip install -r requirements.txt`
3. Configure o comando de start: `python run_server.py`

## 📁 Estrutura do Projeto

```
pdf-downloader-web/
├── pdf_downloader.py          # Script original de download
├── README.md                  # Documentação do projeto
├── index.html                 # Interface web standalone
├── styles.css                 # Estilos da interface
├── script.js                  # JavaScript da interface
└── pdf-downloader-backend/    # Aplicação Flask completa
    ├── src/
    │   ├── main.py           # Aplicação Flask principal
    │   ├── pdf_downloader.py # Módulo de download
    │   ├── routes/
    │   │   ├── downloader.py # Rotas da API
    │   │   └── user.py       # Rotas de usuário
    │   ├── static/           # Arquivos estáticos (HTML, CSS, JS)
    │   └── models/           # Modelos de banco de dados
    ├── run_server.py         # Script para executar o servidor
    ├── requirements.txt      # Dependências Python
    └── venv/                 # Ambiente virtual
```

## 🔧 Configuração da API

### Endpoints Disponíveis

#### POST /api/download/scribd
Baixa um documento do Scribd.

**Payload:**
```json
{
    "url": "https://www.scribd.com/document/123456/exemplo",
    "output_dir": "downloads"
}
```

#### POST /api/search/public-domain
Busca livros em domínio público.

**Payload:**
```json
{
    "query": "python programming",
    "max_results": 10
}
```

#### GET /api/health
Verifica o status da API.

### Configuração CORS

A aplicação já está configurada para aceitar requisições de qualquer origem (CORS habilitado).

## 🛠️ Personalização

### Modificar Estilos
Edite o arquivo `src/static/styles.css` para personalizar a aparência.

### Adicionar Funcionalidades
1. Crie novas rotas em `src/routes/`
2. Registre as rotas em `src/main.py`
3. Atualize o frontend em `src/static/`

### Configurar Banco de Dados
O projeto já inclui SQLAlchemy configurado. Para usar:
1. Defina modelos em `src/models/`
2. Configure a URI do banco em `src/main.py`

## 🔒 Considerações de Segurança

### Para Produção:
1. **Altere a SECRET_KEY** em `src/main.py`
2. **Configure HTTPS** no servidor web
3. **Use um banco de dados robusto** (PostgreSQL, MySQL)
4. **Configure rate limiting** para as APIs
5. **Implemente autenticação** se necessário

### Variáveis de Ambiente Recomendadas:
```bash
export SECRET_KEY="sua-chave-secreta-super-segura"
export DATABASE_URL="postgresql://user:pass@localhost/dbname"
export FLASK_ENV="production"
```

## 📝 Notas Importantes

### Aspectos Legais
- O software foi desenvolvido para fins educacionais
- Respeite os direitos autorais e termos de serviço das plataformas
- Use apenas para conteúdo que você tem direito de acessar

### Limitações Técnicas
- Os serviços de terceiros para Scribd podem ter limitações
- A disponibilidade dos downloads depende dos serviços externos
- Alguns documentos podem não estar disponíveis para download

## 🆘 Solução de Problemas

### Erro: "Port already in use"
```bash
# Encontre o processo usando a porta
lsof -i :5001
# Mate o processo
kill -9 <PID>
```

### Erro: "Module not found"
```bash
# Certifique-se de que o ambiente virtual está ativo
source venv/bin/activate
# Reinstale as dependências
pip install -r requirements.txt
```

### Erro: "CORS policy"
Verifique se o CORS está habilitado no backend (`CORS(app)` em `main.py`).

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do servidor
2. Consulte a documentação das dependências
3. Abra uma issue no repositório GitHub

## 🔄 Atualizações

Para atualizar o projeto:
```bash
git pull origin master
cd pdf-downloader-backend
source venv/bin/activate
pip install -r requirements.txt
```

---

**Desenvolvido com ❤️ para democratizar o acesso ao conhecimento**


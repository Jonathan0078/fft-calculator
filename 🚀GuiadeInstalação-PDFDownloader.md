# 🚀 Guia de Instalação - PDF Downloader

## 📋 Pré-requisitos

Antes de instalar o PDF Downloader, certifique-se de ter:

- **Python 3.11 ou superior** instalado
- **pip** (gerenciador de pacotes Python)
- **Conexão com a internet** para baixar dependências
- **Sistema operacional**: Linux, macOS ou Windows

## 🔧 Instalação Passo a Passo

### 1. Preparação do Ambiente

#### No Linux/macOS:
```bash
# Verificar versão do Python
python3 --version

# Verificar se o pip está instalado
pip3 --version
```

#### No Windows:
```cmd
# Verificar versão do Python
python --version

# Verificar se o pip está instalado
pip --version
```

### 2. Download do Software

Você pode obter o software de duas formas:

#### Opção A: Download Direto
- Baixe o arquivo ZIP do projeto
- Extraia para uma pasta de sua escolha
- Navegue até a pasta extraída

#### Opção B: Git Clone (se disponível)
```bash
git clone <url-do-repositorio>
cd pdf_downloader
```

### 3. Configuração do Ambiente Virtual

```bash
# Navegar para a pasta do projeto
cd pdf_downloader

# Ativar o ambiente virtual (já incluído)
# No Linux/macOS:
source venv/bin/activate

# No Windows:
venv\Scripts\activate
```

### 4. Instalação das Dependências

```bash
# Instalar todas as dependências Python
pip install -r requirements.txt

# Instalar navegadores do Playwright
playwright install
```

### 5. Instalação de Dependências do Sistema (Linux)

Se você estiver no Linux e encontrar erros relacionados ao Playwright, instale:

```bash
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install -y \
    libgstreamer1.0-0 \
    libgtk-4-1 \
    libgraphene-1.0-0 \
    libatomic1 \
    libxslt1.1 \
    libevent-2.1-7 \
    libwebpdemux2 \
    libharfbuzz-icu0 \
    libenchant-2-2 \
    libsecret-1-0 \
    libhyphen0

# CentOS/RHEL/Fedora:
sudo yum install -y \
    gstreamer1 \
    gtk4 \
    libatomic \
    libxslt \
    libevent \
    libwebp \
    harfbuzz-icu \
    enchant2 \
    libsecret \
    hyphen
```

### 6. Verificação da Instalação

```bash
# Testar se o Python consegue importar as bibliotecas
python -c "import flask, playwright, requests, bs4, PIL; print('Todas as dependências instaladas com sucesso!')"

# Verificar se o Playwright está funcionando
python -c "from playwright.sync_api import sync_playwright; print('Playwright instalado corretamente!')"
```

### 7. Primeira Execução

```bash
# Iniciar o servidor
python src/main.py
```

Você deve ver uma saída similar a:
```
 * Serving Flask app 'main'
 * Debug mode: on
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[seu-ip]:5000
```

### 8. Teste da Aplicação

1. Abra seu navegador
2. Vá para: `http://localhost:5000`
3. Você deve ver a interface do PDF Downloader
4. Teste com uma URL de exemplo

## 🐛 Solução de Problemas de Instalação

### Erro: "Python não encontrado"
```bash
# Instalar Python (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install python3 python3-pip

# Instalar Python (CentOS/RHEL)
sudo yum install python3 python3-pip

# No Windows: Baixe do site oficial python.org
```

### Erro: "pip não encontrado"
```bash
# Linux
sudo apt-get install python3-pip

# macOS
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py

# Windows: Reinstale o Python com pip incluído
```

### Erro: "Permissão negada"
```bash
# Use --user para instalar apenas para o usuário atual
pip install --user -r requirements.txt

# Ou use sudo (não recomendado)
sudo pip install -r requirements.txt
```

### Erro: "Playwright browsers not found"
```bash
# Reinstalar navegadores do Playwright
playwright install --force

# Se ainda não funcionar, instalar dependências do sistema
playwright install-deps
```

### Erro: "Port 5000 already in use"
```bash
# Encontrar processo usando a porta
lsof -i :5000

# Matar processo (substitua PID pelo número encontrado)
kill -9 PID

# Ou usar uma porta diferente
python src/main.py --port 8000
```

### Erro: "ModuleNotFoundError"
```bash
# Verificar se o ambiente virtual está ativo
which python

# Reinstalar dependências
pip install -r requirements.txt --force-reinstall
```

## 🔧 Configurações Avançadas

### Configurar Porta Personalizada

Edite o arquivo `src/main.py` e altere a linha:
```python
app.run(host='0.0.0.0', port=5000, debug=True)
```
Para:
```python
app.run(host='0.0.0.0', port=8080, debug=True)  # Sua porta preferida
```

### Configurar para Produção

Para uso em produção, desative o modo debug:
```python
app.run(host='0.0.0.0', port=5000, debug=False)
```

### Configurar Proxy (se necessário)

Se você estiver atrás de um proxy corporativo:
```bash
export HTTP_PROXY=http://proxy.empresa.com:8080
export HTTPS_PROXY=http://proxy.empresa.com:8080
pip install -r requirements.txt
```

## 📁 Estrutura Após Instalação

```
pdf_downloader/
├── venv/                    # Ambiente virtual Python
│   ├── bin/                 # Executáveis (Linux/macOS)
│   ├── Scripts/             # Executáveis (Windows)
│   └── lib/                 # Bibliotecas instaladas
├── src/                     # Código fonte
│   ├── main.py             # Arquivo principal
│   ├── routes/             # Rotas da API
│   ├── static/             # Interface web
│   └── database/           # Banco de dados
├── requirements.txt         # Lista de dependências
├── README.md               # Documentação principal
├── INSTALL.md              # Este guia
└── server.log              # Logs (criado após execução)
```

## ✅ Verificação Final

Após a instalação, verifique se tudo está funcionando:

1. **Servidor iniciando**: `python src/main.py`
2. **Interface carregando**: Acesse `http://localhost:5000`
3. **API funcionando**: `curl http://localhost:5000/api/advanced/status-advanced`
4. **Download teste**: Teste com uma URL simples

## 🆘 Suporte de Instalação

Se você encontrar problemas durante a instalação:

1. **Verifique os logs**: `tail -f server.log`
2. **Teste dependências**: Execute os comandos de verificação
3. **Reinstale**: Remova `venv/` e reinstale tudo
4. **Documentação**: Consulte o README.md para mais detalhes

## 🔄 Atualizações

Para atualizar o software:

1. **Backup**: Faça backup de suas configurações
2. **Download**: Baixe a nova versão
3. **Dependências**: Execute `pip install -r requirements.txt --upgrade`
4. **Teste**: Verifique se tudo funciona corretamente

---

**Instalação concluída com sucesso! 🎉**

Agora você pode usar o PDF Downloader para baixar documentos de forma legal e responsável.


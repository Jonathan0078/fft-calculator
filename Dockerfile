FROM python:3.11-slim

# Instalar dependências do sistema necessárias para o Playwright
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libgstreamer1.0-0 \
    libgtk-4-1 \
    libgraphene-1.0-0 \
    libatomic1 \
    libxslt1.1 \
    libwoff1 \
    libevent-2.1-7 \
    libgstreamer-plugins-base1.0-0 \
    libgstreamer-plugins-good1.0-0 \
    libgstreamer-plugins-bad1.0-0 \
    libwebpdemux2 \
    libavif13 \
    libharfbuzz-icu0 \
    libenchant-2-2 \
    libsecret-1-0 \
    libhyphen0 \
    libmanette-0.2-0 \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar requirements.txt do diretório do backend
COPY pdf-downloader-backend/requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Instalar navegadores do Playwright
RUN playwright install chromium
RUN playwright install-deps

# Copiar todo o conteúdo do repositório para o diretório de trabalho
COPY . .

# Expor porta
EXPOSE 5000

# Comando para iniciar a aplicação (apontando para o main.py dentro do diretório do backend)
CMD ["python", "pdf-downloader-backend/src/main.py"]
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Install Python dependencies if needed
RUN apk add --no-cache python3 py3-pip
COPY pdf-downloader-backend/requirements.txt ./
RUN pip3 install -r requirements.txt

EXPOSE 5000

CMD ["node", "run.js"]

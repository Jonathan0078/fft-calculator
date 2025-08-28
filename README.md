# Dashboard de Manutenção - Versão Firebase

Esta é uma versão completamente frontend do dashboard de manutenção que funciona sem servidor, usando Firebase para armazenamento de dados.

## Características

- ✅ **100% Frontend**: Funciona apenas no navegador, sem necessidade de servidor
- ✅ **Processamento Local**: Arquivos Excel são processados diretamente no navegador
- ✅ **Firebase Integration**: Dados são salvos no Firebase Firestore
- ✅ **Upload Flexível**: Aceita qualquer arquivo Excel (.xlsx)
- ✅ **Análises Avançadas**: KPIs, gráficos interativos, análise preditiva
- ✅ **Responsivo**: Funciona em desktop e mobile

## Como Configurar

### 1. Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative o Firestore Database
4. Copie as configurações do projeto

### 2. Configurar o Projeto

1. Abra o arquivo `index.html`
2. Encontre a seção de configuração do Firebase:
```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```
3. Substitua pelos dados do seu projeto Firebase

### 3. Hospedar no Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Fazer login
firebase login

# Inicializar projeto (na pasta do dashboard)
firebase init hosting

# Fazer deploy
firebase deploy
```

## Como Usar

### 1. Upload de Arquivo Excel

1. Clique no ícone de upload na barra lateral
2. Selecione um arquivo Excel (.xlsx)
3. Clique em "Processar Arquivo"
4. Aguarde o processamento e volte ao dashboard

### 2. Visualizar Dados

- **Dashboard Principal**: KPIs e gráficos principais
- **Análises**: Top 10 equipamentos por custo
- **Preditiva**: Equipamentos com maior risco
- **Exportar**: Download de relatório em texto

### 3. Atualizar Dados

- Faça upload de um novo arquivo Excel
- Os dados anteriores serão substituídos
- O dashboard será atualizado automaticamente

## Estrutura de Arquivos

```
dashboard-frontend-only/
├── index.html          # Interface principal
├── dashboard.js        # Lógica JavaScript
├── firebase.json       # Configuração Firebase Hosting
└── README.md          # Esta documentação
```

## Funcionalidades

### KPIs Calculados
- Manutenções Corretivas, Preventivas, Preditivas
- Preventivas Vencidas
- Total de Equipamentos
- Disponibilidade (calculada)
- Custo Total

### Gráficos Interativos
- MTTR (Tempo Médio de Reparo)
- MTBF (Tempo Médio Entre Falhas)
- Custos Mensais
- O.S Corretivas Mensais

### Análises Avançadas
- Ranking de equipamentos por custo
- Score de risco por equipamento
- Análise preditiva baseada em histórico

## Vantagens desta Versão

1. **Sem Servidor**: Não precisa de Flask, Python ou servidor
2. **Hospedagem Gratuita**: Firebase Hosting é gratuito
3. **Escalável**: Firebase escala automaticamente
4. **Seguro**: Dados ficam no Firebase, não em servidor próprio
5. **Rápido**: Processamento local do Excel
6. **Flexível**: Aceita qualquer nome de arquivo Excel

## Limitações

- Arquivos Excel muito grandes (>10MB) podem ser lentos
- Funciona apenas com navegadores modernos
- Requer conexão com internet para salvar no Firebase
- Dados ficam públicos se não configurar autenticação

## Próximos Passos

1. Configurar autenticação Firebase (opcional)
2. Adicionar regras de segurança no Firestore
3. Implementar cache offline
4. Adicionar mais tipos de análises
5. Criar dashboard para múltiplos usuários

## Suporte

Este dashboard processa automaticamente arquivos Excel com a mesma estrutura do arquivo original fornecido. Se você tiver um arquivo com estrutura diferente, pode ser necessário ajustar o código JavaScript.


// Espera a página HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

    // Pega os elementos do HTML com os quais vamos interagir
    const cpfInput = document.getElementById('cpfInput');
    const cpfBtn = document.getElementById('cpfBtn');
    const resultadoDiv = document.getElementById('resultado');

    // ** IMPORTANTE: URL da sua API no PythonAnywhere **
    // Este é o endereço do "motor" que você criou.
    const apiUrlBase = 'https://jonathancent77.pythonanywhere.com/api';

    // Adiciona uma função para ser executada quando o botão for clicado
    cpfBtn.addEventListener('click', () => {
        const cpf = cpfInput.value; // Pega o valor digitado no campo de CPF

        // Verifica se o campo não está vazio
        if (!cpf) {
            alert("Por favor, digite um CPF para consultar.");
            return; // Para a execução se estiver vazio
        }

        // Chama a função que faz a consulta
        fazerConsulta(cpf);
    });

    // Função que se comunica com a sua API
    function fazerConsulta(cpf) {
        // Mostra uma mensagem de "carregando" para o usuário
        resultadoDiv.textContent = 'Consultando, por favor aguarde...';

        // Monta o endereço completo da consulta
        const urlCompleta = `${apiUrlBase}/cpf/${cpf}`;

        // O 'fetch' é a ferramenta do JavaScript para fazer requisições na internet
        fetch(urlCompleta)
            .then(response => {
                // Se a resposta da API não for um sucesso (ex: erro 404, 500), joga um erro
                if (!response.ok) {
                    throw new Error(`Erro na rede: ${response.status}`);
                }
                // Converte a resposta (que vem em texto) para o formato JSON
                return response.json();
            })
            .then(data => {
                // Se tudo deu certo, 'data' é o objeto JSON retornado pela sua API
                // JSON.stringify formata o objeto para ser exibido de forma bonita
                resultadoDiv.textContent = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                // Se qualquer passo acima der errado, este bloco é executado
                console.error("Ocorreu um erro:", error);
                resultadoDiv.textContent = `Ocorreu um erro ao consultar. Verifique o console do navegador para mais detalhes.`;
            });
    }
});

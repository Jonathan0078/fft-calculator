document.addEventListener('DOMContentLoaded', () => {
    const botao = document.querySelector('button[data-tipo="cpf"]');
    const resultadoDiv = document.getElementById('resultado');

    // IMPORTANTE: Coloque o URL da sua API aqui!
    const apiUrlBase = 'https://SeuUsuario.pythonanywhere.com/api'; // <-- MUDE "SeuUsuario"

    botao.addEventListener('click', () => {
        const tipoConsulta = botao.dataset.tipo;
        const valorInput = document.getElementById(`${tipoConsulta}Input`).value;

        if (!valorInput) {
            alert(`Por favor, digite o ${tipoConsulta.toUpperCase()}.`);
            return;
        }
        consultar(tipoConsulta, valorInput);
    });

    function consultar(tipo, valor) {
        resultadoDiv.textContent = 'Consultando, por favor aguarde...';
        const urlCompleto = `${apiUrlBase}/${tipo}/${valor}`;

        fetch(urlCompleto)
            .then(response => response.json())
            .then(data => {
                resultadoDiv.textContent = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                console.error("Erro na consulta:", error);
                resultadoDiv.textContent = `Ocorreu um erro ao consultar.`;
            });
    }
});

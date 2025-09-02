// Controle de navegação do menu
// Função global para mostrar seções
window.showSection = function(sectionId) {
    const contentSections = document.querySelectorAll('.content-section');
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Esconde todas as seções
    contentSections.forEach(section => {
        section.classList.remove('active');
    });

    // Remove active de todos os itens do menu
    menuItems.forEach(item => {
        item.classList.remove('active');
    });

    // Mostra a seção selecionada
    const selectedSection = document.getElementById(`${sectionId}-section`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Ativa o item do menu
    const selectedMenuItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (selectedMenuItem) {
        selectedMenuItem.classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const mainContent = document.querySelector('.main-content');

    // Função para inicializar as seções com o conteúdo correto
    function initializeSections() {
        const sections = {
            'capture': ['.sensor-controls', '.input-column'],
            'analysis': ['.output-column', '#fft-output'],
            'diagnostic': ['#interpretation-section', '#alerts-section'],
            '3d-view': ['#spectral-3d-section'],
            'reports': ['#reports-tab'],
            'database': ['#database-tools'],
            'settings': ['#settings-section']
        };

        // Move o conteúdo para as seções apropriadas
        Object.entries(sections).forEach(([sectionId, selectors]) => {
            const targetSection = document.getElementById(`${sectionId}-section`);
            if (targetSection) {
                selectors.forEach(selector => {
                    const content = document.querySelector(selector);
                    if (content) {
                        // Move o conteúdo original para a seção
                        targetSection.appendChild(content);
                    }
                });
            }
        });
    }

    // Adiciona evento de clique para mostrar a seção na MESMA aba e atualizar o hash
    menuItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault(); // Previne qualquer comportamento padrão de navegação
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                // Mostra a seção correta
                window.showSection(sectionId);
                // Atualiza o hash na URL para permitir navegação pelo histórico (back/forward)
                location.hash = encodeURIComponent(sectionId);
            }
        });
    });

    // Ouve por mudanças no hash (botões de voltar/avançar) e carrega a seção correta
    window.addEventListener('hashchange', () => {
        const hash = location.hash ? decodeURIComponent(location.hash.replace('#', '')) : 'capture';
        window.showSection(hash);
    });

    // Inicializa as seções movendo o conteúdo
    initializeSections();

    // Mostra a seção correta ao carregar a página (baseado no hash ou padrão)
    const initialHash = location.hash ? decodeURIComponent(location.hash.replace('#', '')) : 'capture';
    window.showSection(initialHash);
});

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

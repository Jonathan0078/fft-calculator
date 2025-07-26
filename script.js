// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelectorAll('.nav-link');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Mobile Menu Toggle
mobileMenuBtn?.addEventListener('click', () => {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('active');
});

// Navigation Active State
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Smooth Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const sectionTop = section.offsetTop - headerHeight;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// Tab Functionality
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // Remove active class from all tabs and contents
        tabBtns.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        btn.classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// Navigation Link Click Handlers
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        scrollToSection(targetId);
    });
});

// Header Scroll Effect
function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
}

// Download from Scribd Function
async function downloadFromScribd() {
    const urlInput = document.getElementById('scribdUrl');
    const outputDirInput = document.getElementById('outputDir');
    const downloadBtn = document.querySelector('#scribd-tab .btn-download');
    const resultDiv = document.getElementById('scribdResult');
    
    const url = urlInput.value.trim();
    const outputDir = outputDirInput.value.trim() || 'downloads';
    
    // Validation
    if (!url) {
        showResult(resultDiv, 'Por favor, insira uma URL válida do Scribd.', 'error');
        return;
    }
    
    if (!isValidScribdUrl(url)) {
        showResult(resultDiv, 'URL inválida. Use URLs do formato: https://www.scribd.com/document/...', 'error');
        return;
    }
    
    // Show loading state
    downloadBtn.classList.add('loading');
    downloadBtn.disabled = true;
    hideResult(resultDiv);
    
    try {
        // Simulate API call (replace with actual backend call)
        const response = await simulateDownload(url, outputDir);
        
        if (response.success) {
            showResult(resultDiv, `✅ Download iniciado! O arquivo será salvo em: ${response.filepath}`, 'success');
        } else {
            showResult(resultDiv, `❌ Erro no download: ${response.error}`, 'error');
        }
    } catch (error) {
        showResult(resultDiv, `❌ Erro inesperado: ${error.message}`, 'error');
    } finally {
        // Hide loading state
        downloadBtn.classList.remove('loading');
        downloadBtn.disabled = false;
    }
}

// Search Public Domain Function
async function searchPublicDomain() {
    const queryInput = document.getElementById('searchQuery');
    const downloadBtn = document.querySelector('#public-tab .btn-download');
    const resultDiv = document.getElementById('publicResult');
    
    const query = queryInput.value.trim();
    
    // Validation
    if (!query) {
        showResult(resultDiv, 'Por favor, insira um termo de busca.', 'error');
        return;
    }
    
    // Show loading state
    downloadBtn.classList.add('loading');
    downloadBtn.disabled = true;
    hideResult(resultDiv);
    
    try {
        // Simulate search (replace with actual backend call)
        const results = await simulateSearch(query);
        
        let resultHTML = `<h4>📚 Resultados para "${query}":</h4><div class="search-results">`;
        
        results.forEach(result => {
            resultHTML += `
                <div class="search-result-item">
                    <h5><a href="${result.url}" target="_blank">${result.title}</a></h5>
                    <p>${result.description}</p>
                    <small>Fonte: ${result.source}</small>
                </div>
            `;
        });
        
        resultHTML += '</div>';
        
        showResult(resultDiv, resultHTML, 'info');
    } catch (error) {
        showResult(resultDiv, `❌ Erro na busca: ${error.message}`, 'error');
    } finally {
        // Hide loading state
        downloadBtn.classList.remove('loading');
        downloadBtn.disabled = false;
    }
}

// Utility Functions
function isValidScribdUrl(url) {
    const validPatterns = [
        /^https:\/\/www\.scribd\.com\/document\//,
        /^https:\/\/www\.scribd\.com\/doc\//,
        /^https:\/\/www\.scribd\.com\/presentation\//
    ];
    
    return validPatterns.some(pattern => pattern.test(url));
}

function showResult(element, message, type) {
    element.innerHTML = message;
    element.className = `download-result ${type}`;
    element.style.display = 'block';
    
    // Auto-hide after 10 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            hideResult(element);
        }, 10000);
    }
}

function hideResult(element) {
    element.style.display = 'none';
}

// Simulate Download (Replace with actual backend integration)
async function simulateDownload(url, outputDir) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random success/failure for demo
    const success = Math.random() > 0.3; // 70% success rate
    
    if (success) {
        const filename = `documento_${Date.now()}.pdf`;
        return {
            success: true,
            filepath: `${outputDir}/${filename}`
        };
    } else {
        return {
            success: false,
            error: 'Não foi possível baixar o arquivo. Tente novamente ou verifique se o documento está disponível.'
        };
    }
}

// Simulate Search (Replace with actual backend integration)
async function simulateSearch(query) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock search results
    const mockResults = [
        {
            title: `Livros sobre "${query}" - Domínio Público`,
            description: 'Acesse a biblioteca digital do governo brasileiro para encontrar livros gratuitos.',
            url: `http://www.dominiopublico.gov.br/pesquisa/PesquisaObraForm.jsp?select_action=&co_autor=&co_categoria=2&co_obra=&co_idioma=1&no_autor=&co_midia=2&pagina=1&ds_titulo=${encodeURIComponent(query)}`,
            source: 'Domínio Público'
        },
        {
            title: `"${query}" - Project Gutenberg`,
            description: 'Explore mais de 75.000 eBooks gratuitos na maior biblioteca digital do mundo.',
            url: `https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(query)}`,
            source: 'Project Gutenberg'
        },
        {
            title: `Buscar "${query}" - Baixe Livros`,
            description: 'Encontre livros em português para download gratuito.',
            url: `https://www.baixelivros.com.br/?s=${encodeURIComponent(query)}`,
            source: 'Baixe Livros'
        },
        {
            title: `"${query}" - Internet Archive`,
            description: 'Arquivo digital com milhões de livros, filmes, música e muito mais.',
            url: `https://archive.org/search.php?query=${encodeURIComponent(query)}&and[]=mediatype%3A%22texts%22`,
            source: 'Internet Archive'
        }
    ];
    
    return mockResults;
}

// Intersection Observer for Animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .download-card, .source-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Form Enhancement
function enhanceFormInputs() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        // Add floating label effect
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // Real-time validation for Scribd URL
        if (input.id === 'scribdUrl') {
            input.addEventListener('input', () => {
                const url = input.value.trim();
                if (url && !isValidScribdUrl(url)) {
                    input.style.borderColor = 'var(--error-color)';
                } else {
                    input.style.borderColor = 'var(--border-color)';
                }
            });
        }
    });
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to trigger download in active tab
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab) {
                const downloadBtn = activeTab.querySelector('.btn-download');
                if (downloadBtn && !downloadBtn.disabled) {
                    downloadBtn.click();
                }
            }
        }
        
        // Escape to clear results
        if (e.key === 'Escape') {
            const results = document.querySelectorAll('.download-result');
            results.forEach(result => hideResult(result));
        }
    });
}

// Copy to Clipboard Function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary success message
        const toast = document.createElement('div');
        toast.textContent = 'Copiado para a área de transferência!';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    });
}

// Add CSS for toast animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .search-results {
        margin-top: 1rem;
    }
    
    .search-result-item {
        background: rgba(255, 255, 255, 0.5);
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        border-left: 4px solid var(--primary-color);
    }
    
    .search-result-item h5 {
        margin-bottom: 0.5rem;
    }
    
    .search-result-item a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 600;
    }
    
    .search-result-item a:hover {
        text-decoration: underline;
    }
    
    .search-result-item p {
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }
    
    .search-result-item small {
        color: var(--text-light);
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// Event Listeners
window.addEventListener('scroll', () => {
    updateActiveNavLink();
    handleHeaderScroll();
});

window.addEventListener('load', () => {
    initAnimations();
    enhanceFormInputs();
    initKeyboardShortcuts();
});

// Expose functions to global scope for HTML onclick handlers
window.downloadFromScribd = downloadFromScribd;
window.searchPublicDomain = searchPublicDomain;
window.scrollToSection = scrollToSection;
window.copyToClipboard = copyToClipboard;


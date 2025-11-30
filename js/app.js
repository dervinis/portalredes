// ============================================
// ESTRUTURA DE MENU E TÓPICOS
// ============================================
const menuStructure = {
    python: {
        title: 'Python',
        topics: [
            'introduction',
            'syntax',
            'variables',
            'data-types',
            'operators'
        ]
    },
    ccna: {
        title: 'CCNA',
        topics: [
            'networking-basics',
            'osi-model',
            'tcp-ip',
            'routing',
            'switching'
        ]
    },
    ccnp: {
        title: 'CCNP',
        topics: [
            'advanced-routing',
            'bgp',
            'mpls',
            'qos',
            'network-security'
        ]
    }
};

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================
let currentCategory = 'python';
let currentTopic = 'introduction';

// ============================================
// ELEMENTOS DO DOM
// ============================================
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const categoryTitle = document.getElementById('categoryTitle');
const carousel = document.getElementById('carousel');
const contentArticle = document.getElementById('contentArticle');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const navItems = document.querySelectorAll('.nav-item');

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Carrega o conteúdo Markdown de um tópico
 */
async function loadContent(category, topic) {
    const filePath = `content/${category}/${topic}.md`;
    
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Arquivo não encontrado: ${filePath}`);
        }
        const markdown = await response.text();
        renderMarkdown(markdown);
    } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        contentArticle.innerHTML = `
            <h1>${topic.replace(/-/g, ' ').toUpperCase()}</h1>
            <p>Conteúdo em desenvolvimento. Arquivo esperado em: <code>${filePath}</code></p>
        `;
    }
}

/**
 * Renderiza Markdown simples para HTML
 */
function renderMarkdown(markdown) {
    let html = markdown;

    // Títulos
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

    // Negrito e itálico
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Código inline
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Blocos de código
    html = html.replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Listas não ordenadas
    html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\n<ul>/g, '');

    // Listas ordenadas
    html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');

    // Tabelas (simples)
    html = html.replace(/\| (.*?) \|\n\| [-:\| ]+ \|\n([\s\S]*?)(?=\n\n|$)/g, (match, header, body) => {
        const headers = header.split('|').map(h => h.trim()).filter(h => h);
        const rows = body.trim().split('\n').map(row => 
            row.split('|').map(cell => cell.trim()).filter(cell => cell)
        );

        let table = '<table><thead><tr>';
        headers.forEach(h => table += `<th>${h}</th>`);
        table += '</tr></thead><tbody>';
        rows.forEach(row => {
            table += '<tr>';
            row.forEach(cell => table += `<td>${cell}</td>`);
            table += '</tr>';
        });
        table += '</tbody></table>';
        return table;
    });

    // Blockquotes
    html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

    // Parágrafos
    html = html.split('\n\n').map(para => {
        if (para.match(/^<[h|u|o|l|p|b|t]/)) {
            return para;
        }
        return `<p>${para}</p>`;
    }).join('\n');

    contentArticle.innerHTML = html;
}

/**
 * Escapa caracteres HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Atualiza o carrossel de tópicos
 */
function updateCarousel() {
    const topics = menuStructure[currentCategory].topics;
    carousel.innerHTML = '';

    topics.forEach(topic => {
        const button = document.createElement('button');
        button.className = `carousel-item ${topic === currentTopic ? 'active' : ''}`;
        button.textContent = topic.replace(/-/g, ' ');
        button.onclick = () => selectTopic(topic);
        carousel.appendChild(button);
    });
}

/**
 * Seleciona um tópico
 */
function selectTopic(topic) {
    currentTopic = topic;
    updateCarousel();
    loadContent(currentCategory, currentTopic);
    closeMobileMenu();
}

/**
 * Seleciona uma categoria
 */
function selectCategory(category) {
    currentCategory = category;
    currentTopic = menuStructure[category].topics[0];
    
    // Atualiza UI
    categoryTitle.textContent = menuStructure[category].title;
    navItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    updateCarousel();
    loadContent(currentCategory, currentTopic);
    closeMobileMenu();
}

/**
 * Navega no carrossel
 */
function scrollCarousel(direction) {
    const scrollAmount = 200;
    if (direction === 'prev') {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

/**
 * Abre/fecha o menu mobile
 */
function toggleMobileMenu() {
    sidebar.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

/**
 * Fecha o menu mobile
 */
function closeMobileMenu() {
    sidebar.classList.remove('active');
    menuToggle.classList.remove('active');
}

// ============================================
// EVENT LISTENERS
// ============================================

// Menu toggle mobile
menuToggle.addEventListener('click', toggleMobileMenu);

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMobileMenu();
    }
});

// Navegação de categorias
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const category = item.dataset.category;
        selectCategory(category);
    });
});

// Botões do carrossel
prevBtn.addEventListener('click', () => scrollCarousel('prev'));
nextBtn.addEventListener('click', () => scrollCarousel('next'));

// ============================================
// INICIALIZAÇÃO
// ============================================

function init() {
    // Carrega conteúdo inicial
    updateCarousel();
    loadContent(currentCategory, currentTopic);
}

// Inicia a aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

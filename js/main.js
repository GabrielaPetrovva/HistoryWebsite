// === МОБИЛНО МЕНЮ ===
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Затваряне на менюто при клик извън него
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }
});

// === SCROLL ANIMATIONS ===
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Наблюдение на елементи за анимация при скрол
document.querySelectorAll('.article-section, .figure-item, .timeline-event, .cta-card').forEach(item => {
    observer.observe(item);
});

// === ПЛАВЕН СКРОЛ ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// === ИНТЕРАКТИВНОСТ НА ТЪРСАЧКАТА ===
function initSearchBox() {
    const searchBox = document.querySelector('.search-box');
    
    if (!searchBox) return;

    searchBox.addEventListener('focus', () => {
        searchBox.parentElement.style.transform = 'scale(1.02)';
    });

    searchBox.addEventListener('blur', () => {
        searchBox.parentElement.style.transform = 'scale(1)';
    });
}

// === ИНИЦИАЛИЗАЦИЯ НА ГЛАВНА ТЪРСАЧКА ===
document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.querySelector('.search-box');
    if (!searchBox) return;
    
    // Enter за redirect към каталог
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.trim();
            if (searchTerm.length >= 2) {
                window.location.href = `html/catalog.html?search=${encodeURIComponent(searchTerm)}`;
            }
        }
    });
    
    // Input за бъдещи suggestions
    searchBox.addEventListener('input', (e) => {
        handleMainSearch(e.target.value.toLowerCase());
    });
});
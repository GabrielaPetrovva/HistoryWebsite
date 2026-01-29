// === PERSON PAGE FUNCTIONALITY ===

document.addEventListener('DOMContentLoaded', () => {
    initPersonAnimations();
    initRelatedPersons();
});

// === SCROLL ANIMATIONS ЗА СЕКЦИИ ===
function initPersonAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Наблюдаваме всички article секции
    document.querySelectorAll('.article-section').forEach(section => {
        observer.observe(section);
    });

    // Наблюдаваме timeline items
    document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
    });

    // Наблюдаваме related cards
    document.querySelectorAll('.related-card').forEach(card => {
        observer.observe(card);
    });
}

// === СВЪРЗАНИ ЛИЧНОСТИ НАВИГАЦИЯ ===
function initRelatedPersons() {
    const relatedCards = document.querySelectorAll('.related-card');
    
    relatedCards.forEach(card => {
        card.addEventListener('click', () => {
            // За сега просто redirect към person.html
            // По-късно ще добавим динамично зареждане
            window.location.href = 'person.html';
        });

        // Добавяме cursor pointer визуално
        card.style.cursor = 'pointer';
    });
}

// === СПОДЕЛЯНЕ (ОПЦИОНАЛНО) ===
function initShareButtons() {
    const shareBtn = document.querySelector('.share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: document.querySelector('.person-title').textContent,
                text: document.querySelector('.person-subtitle').textContent,
                url: window.location.href
            });
        } else {
            // Fallback - копиране на линк
            navigator.clipboard.writeText(window.location.href);
            alert('Линкът е копиран!');
        }
    });
}

// === PRINT ФУНКЦИОНАЛНОСТ (ОПЦИОНАЛНО) ===
function initPrintButton() {
    const printBtn = document.querySelector('.print-btn');
    if (!printBtn) return;

    printBtn.addEventListener('click', () => {
        window.print();
    });
}
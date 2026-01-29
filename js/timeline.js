// === TIMELINE FUNCTIONALITY ===

document.addEventListener('DOMContentLoaded', () => {
    initTimelineAnimations();
    initTimelineFilters();
});

// === SCROLL ANIMATIONS ===
function initTimelineAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Наблюдаваме всички timeline събития
    document.querySelectorAll('.timeline-event').forEach(event => {
        observer.observe(event);
    });
}

// === ФИЛТРИРАНЕ ПО КАТЕГОРИЯ ===
function initTimelineFilters() {
    // Създаваме филтър контейнер
    createFilterButtons();
    
    // Event listeners за филтрите
    const filterButtons = document.querySelectorAll('.timeline-filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterByCategory(category);
            
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// === EXPAND/COLLAPSE СЪБИТИЯ (опционално) ===
function initEventExpansion() {
    const events = document.querySelectorAll('.event-content');
    
    events.forEach(event => {
        event.addEventListener('click', () => {
            event.classList.toggle('expanded');
        });
    });
}
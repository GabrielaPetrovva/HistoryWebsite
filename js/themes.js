// === THEMES FUNCTIONALITY ===

document.addEventListener('DOMContentLoaded', () => {
    initThemeSearch();
    initPeriodFilter();
});

// === ТЪРСЕНЕ НА ТЕМИ ===
function initThemeSearch() {
    const searchInput = document.getElementById('themeSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterThemes(searchTerm, getCurrentPeriod());
    });
}

// === ФИЛТЪР ПО ПЕРИОД ===
function initPeriodFilter() {
    const periodFilter = document.getElementById('periodFilter');
    if (!periodFilter) return;

    periodFilter.addEventListener('change', (e) => {
        const period = e.target.value;
        const searchTerm = document.getElementById('themeSearch')?.value.toLowerCase() || '';
        filterThemes(searchTerm, period);
    });
}

// === ГЛАВНА ФИЛТРИРАЩ ФУНКЦИЯ ===
function filterThemes(searchTerm, period) {
    const themeCards = document.querySelectorAll('.theme-card');
    let visibleCount = 0;

    themeCards.forEach(card => {
        const title = card.querySelector('.theme-title').textContent.toLowerCase();
        const description = card.querySelector('.theme-description').textContent.toLowerCase();
        const card = card.dataset.period || '';

        // Проверка за търсене
        const matchesSearch = !searchTerm || 
            title.includes(searchTerm) || 
            description.includes(searchTerm);

        // Проверка за период
        const matchesPeriod = period === 'all' || 
            cardPeriods.includes(period);

        // Показване/скриване
        if (matchesSearch && matchesPeriod) {
            card.style.display = '';
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.style.display = 'none';
            card.classList.add('hidden');
        }
    });

    // Показване на "Няма резултати" ако няма намерени теми
    showNoResults(visibleCount === 0);
}

// === ПОКАЗВАНЕ НА "НЯМА РЕЗУЛТАТИ" ===
function showNoResults(show) {
    let noResultsDiv = document.querySelector('.no-results');
    
    if (show && !noResultsDiv) {
        const grid = document.querySelector('.themes-grid');
        noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        noResultsDiv.innerHTML = `
            <h3>Няма намерени теми</h3>
            <p>Опитайте с други ключови думи или филтри</p>
        `;
        grid.appendChild(noResultsDiv);
    } else if (!show && noResultsDiv) {
        noResultsDiv.remove();
    }
}

// === HELPER ФУНКЦИЯ ===
function getCurrentPeriod() {
    const periodFilter = document.getElementById('periodFilter');
    return periodFilter ? periodFilter.value : 'all';
}
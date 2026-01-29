// === ДАННИ ЗА ЛИЧНОСТИТЕ ===
const persons = [
    {
 id: "asparuh",
        name: "Хан Аспарух",
        period: "† 700 г.",
        era: "early",
        role: "ruler",
        description: "Основател на Българската държава. През 681 г. изгражда мост между степта и Европа.",
        image: "https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?w=800&h=500&fit=crop",
        link: "person.html?id=asparuh"
    },
    {
        name: "Княз Борис I (Михаил)",
        period: "† 907 г.",
        era: "early",
        role: "ruler",
        description: "Покръстител на България. Избира вяра, но всъщност избира бъдеще.",
        image: "",
        link: "person.html"
    },
    {
        name: "Цар Симеон I Велики",
        period: "864–927 г.",
        era: "early",
        role: "ruler",
        description: "Златният век на книжовността. Строи библиотеки, създава култура.",
        image: "",
        link: "person.html"
    },
    {
        name: "Цар Самуил",
        period: "† 1014 г.",
        era: "early",
        role: "ruler",
        description: "Последният защитник. Четири десетилетия държи империята на разстояние.",
        image: "",
        link: "person.html"
    },
    {
        name: "Паисий Хилендарски",
        period: "1722–1798 г.",
        era: "revival",
        role: "cultural",
        description: "Поставя начало на Възраждането в България.",
        image: "",
        link: "person.html"
    },
    {
        name: "Васил Левски",
        period: "1837–1873 г.",
        era: "revival",
        role: "revolutionary",
        description: "Апостолът на свободата. Изгражда невидима мрежа на надеждата.",
        image: "",
        link: "person.html"
    },
    {
        name: "Христо Ботев",
        period: "1848–1876 г.",
        era: "revival",
        role: "revolutionary",
        description: "Поетът-революционер. Думите и делата са едно.",
        image: "",
        link: "person.html"
    },
    {
        name: "Софроний Врачански",
        period: "1739–1813 г.",
        era: "revival",
        role: "religious",
        description: "Първият препис на История славянобългарска",
        image: "",
        link: "person.html"
    }
];

// === ФИЛТРИРАНЕ И ТЪРСЕНЕ ===
let filteredPersons = [...persons];

function filterPersons() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const eraFilter = document.getElementById('eraFilter').value;
    const roleFilter = document.getElementById('roleFilter').value;

    filteredPersons = persons.filter(person => {
        const matchesSearch = person.name.toLowerCase().includes(searchTerm) || 
                            person.description.toLowerCase().includes(searchTerm);
        const matchesEra = eraFilter === 'all' || person.era === eraFilter;
        const matchesRole = roleFilter === 'all' || person.role === roleFilter;

        return matchesSearch && matchesEra && matchesRole;
    });

    renderPersons();
}

// === РЕНДЕРИРАНЕ НА КАТАЛОГА ===
function renderPersons() {
    const grid = document.getElementById('catalogGrid');
    
    if (filteredPersons.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>Няма намерени резултати</h3>
                <p>Опитайте с други филтри или търсене</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredPersons.map(person => `
        <article class="person-card" onclick="window.location.href='${person.link}'">
            <img src="${person.image}" alt="${person.name}" class="person-card-image">
            <div class="person-card-content">
                <h3 class="person-card-name">${person.name}</h3>
                <p class="person-card-period">${person.period}</p>
                <p class="person-card-description">${person.description}</p>
            </div>
        </article>
    `).join('');

    // Анимация при появяване
    setTimeout(() => {
        document.querySelectorAll('.person-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
        });
    }, 50);
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
    renderPersons();

    // Event listeners за филтрите
    document.getElementById('searchInput').addEventListener('input', filterPersons);
    document.getElementById('eraFilter').addEventListener('change', filterPersons);
    document.getElementById('roleFilter').addEventListener('change', filterPersons);
});

// === URL SEARCH PARAMETERS ===
function initURLSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchParam;
            filterPersons(); // Задейства филтрирането
        }
    }
}

// Извикваме при зареждане
document.addEventListener('DOMContentLoaded', () => {
    initURLSearch();
});
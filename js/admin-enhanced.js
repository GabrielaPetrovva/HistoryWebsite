// === ADMIN PANEL - ENHANCED FUNCTIONALITY ===

// Глобална променлива за текущо редактираната статия
let currentEditingArticleId = null;

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initFilters();
    initImageUpload();
    initFormHandlers();
    initDeleteModal();
    loadDashboard();
    loadArticlesList();
});

// === НАВИГАЦИЯ ===
function initNavigation() {
    document.querySelectorAll('.admin-nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.dataset.view;
            
            document.querySelectorAll('.admin-nav-links a').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            
            showView(view);
        });
    });
}

function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    
    const viewElement = document.getElementById(viewName + '-view');
    if (viewElement) {
        viewElement.classList.remove('hidden');
    }

    // Зареждане на съдържание според view
    if (viewName === 'dashboard') {
        loadDashboard();
    } else if (viewName === 'articles') {
        loadArticlesList();
    } else if (viewName === 'article-form') {
        resetForm();
    }
}

// === ТАБЛО ===
function loadDashboard() {
    const stats = AdminStorage.getStats();
    
    // Update статистики
    const statCards = document.querySelectorAll('.stat-value');
    if (statCards.length >= 3) {
        statCards[0].textContent = stats.published;
        statCards[1].textContent = stats.drafts;
        statCards[2].textContent = stats.total; // Или може да е общ брой личности
    }

    // Зареждане на последни статии в dashboard
    loadRecentArticles();
}

function loadRecentArticles() {
    const articles = AdminStorage.getAllArticles();
    const recentArticles = articles.slice(-3).reverse(); // Последните 3

    const dashboardList = document.querySelector('#dashboard-view .articles-list');
    if (!dashboardList) return;

    dashboardList.innerHTML = recentArticles.map(article => createArticleItemHTML(article)).join('');
    attachArticleActions();
}

// === СПИСЪК СЪС СТАТИИ ===
function loadArticlesList() {
    const articles = AdminStorage.getAllArticles();
    const articlesList = document.querySelector('#articles-view .articles-list');
    
    if (!articlesList) return;

    if (articles.length === 0) {
        articlesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">Все още няма създадени статии</div>
                <button class="btn-primary" onclick="showView('article-form')">Създай първата статия</button>
            </div>
        `;
        return;
    }

    articlesList.innerHTML = articles.map(article => createArticleItemHTML(article)).join('');
    attachArticleActions();
}

// === ГЕНЕРИРАНЕ НА HTML ЗА СТАТИЯ ===
function createArticleItemHTML(article) {
    const figureName = getFigureName(article.figure);
    const date = new Date(article.updatedAt).toLocaleDateString('bg-BG');
    const statusClass = article.status === 'published' ? 'status-published' : 'status-draft';
    const statusText = article.status === 'published' ? 'Публикувана' : 'Чернова';

    return `
        <div class="article-item" data-id="${article.id}">
            <div class="article-info">
                <div class="article-title">${article.title}</div>
                <div class="article-meta">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <span>${figureName}</span>
                    <span>${date}</span>
                </div>
            </div>
            <div class="article-actions">
                <button class="icon-btn edit-btn" data-id="${article.id}" title="Редактиране">✎</button>
                <button class="icon-btn preview-btn" data-id="${article.id}" title="Преглед">👁</button>
                <button class="icon-btn danger delete-btn" data-id="${article.id}" title="Изтриване">🗑</button>
            </div>
        </div>
    `;
}

// === HELPER - Име на личност ===
function getFigureName(figureId) {
    const figures = {
        'asparuh': 'Хан Аспарух',
        'boris': 'Княз Борис I (Михаил)',
        'simeon': 'Цар Симеон I Велики',
        'samuil': 'Цар Самуил',
        'evtimii': 'Патриарх Евтимий Търновски',
        'paisii': 'Паисий Хилендарски'
    };
    return figures[figureId] || 'Неизвестна личност';
}

// === ПРИКАЧВАНЕ НА ACTIONS КЪМ БУТОНИ ===
function attachArticleActions() {
    // Edit бутони
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const articleId = btn.dataset.id;
            editArticle(articleId);
        });
    });

    // Preview бутони
    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const articleId = btn.dataset.id;
            previewArticle(articleId);
        });
    });

    // Delete бутони
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const articleId = btn.dataset.id;
            currentEditingArticleId = articleId; // Запазваме ID за изтриване
            showDeleteModal();
        });
    });
}

// === EDIT СТАТИЯ ===
function editArticle(articleId) {
    const article = AdminStorage.getArticleById(articleId);
    if (!article) {
        alert('Статията не е намерена');
        return;
    }

    currentEditingArticleId = articleId;

    // Зареждаме данните във формата
    document.getElementById('article-title').value = article.title;
    document.getElementById('article-figure').value = article.figure;
    document.getElementById('article-content').value = article.content;

    // Зареждаме изображението ако има
    if (article.image) {
        const preview = document.getElementById('image-preview');
        const placeholder = document.getElementById('upload-placeholder');
        const uploadArea = document.getElementById('image-upload');
        
        preview.src = article.image;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
        uploadArea.classList.add('has-image');
    }

    // Променяме заглавието на формата
    document.querySelector('#article-form-view .page-title').textContent = 'Редактиране на статия';

    // Показваме формата
    showView('article-form');
}

// === PREVIEW СТАТИЯ ===
function previewArticle(articleId) {
    const article = AdminStorage.getArticleById(articleId);
    if (!article) return;

    // Отваряме в нов прозорец или modal
    alert(`PREVIEW:\n\nЗаглавие: ${article.title}\nЛичност: ${getFigureName(article.figure)}\n\n${article.content.substring(0, 200)}...`);
    
    // TODO: По-добър preview modal или redirect към person.html с данните
}

// === ФИЛТРИ ===
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filter = e.target.dataset.filter;
            filterArticles(filter);
        });
    });
}

function filterArticles(status) {
    const articles = AdminStorage.getArticlesByStatus(status);
    const articlesList = document.querySelector('#articles-view .articles-list');
    
    if (!articlesList) return;

    articlesList.innerHTML = articles.map(article => createArticleItemHTML(article)).join('');
    attachArticleActions();
}

// === IMAGE UPLOAD ===
function initImageUpload() {
    const imageInput = document.getElementById('image-input');
    if (!imageInput) return;

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('image-preview');
                const placeholder = document.getElementById('upload-placeholder');
                const uploadArea = document.getElementById('image-upload');
                
                preview.src = e.target.result;
                preview.classList.remove('hidden');
                placeholder.classList.add('hidden');
                uploadArea.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        }
    });
}

// === FORM HANDLERS ===
function initFormHandlers() {
    // Clear errors on input
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
            const errorId = this.id + '-error';
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.classList.add('hidden');
            }
        });
    });
}

// === FORM VALIDATION ===
function validateForm() {
    let isValid = true;
    
    const title = document.getElementById('article-title');
    const titleError = document.getElementById('title-error');
    if (!title.value.trim()) {
        title.classList.add('error');
        titleError.classList.remove('hidden');
        isValid = false;
    } else {
        title.classList.remove('error');
        titleError.classList.add('hidden');
    }
    
    const figure = document.getElementById('article-figure');
    const figureError = document.getElementById('figure-error');
    if (!figure.value) {
        figure.classList.add('error');
        figureError.classList.remove('hidden');
        isValid = false;
    } else {
        figure.classList.remove('error');
        figureError.classList.add('hidden');
    }
    
    const content = document.getElementById('article-content');
    const contentError = document.getElementById('content-error');
    if (!content.value.trim()) {
        content.classList.add('error');
        contentError.classList.remove('hidden');
        isValid = false;
    } else {
        content.classList.remove('error');
        contentError.classList.add('hidden');
    }
    
    return isValid;
}

// === ЗАПАЗВАНЕ КАТО ЧЕРНОВА ===
function saveDraft() {
    const title = document.getElementById('article-title').value.trim();
    const figure = document.getElementById('article-figure').value;
    const content = document.getElementById('article-content').value.trim();
    const image = document.getElementById('image-preview').src;

    if (!title && !figure && !content) {
        alert('Моля, попълнете поне едно поле преди да запазите');
        return;
    }

    const articleData = {
        title: title || 'Без заглавие',
        figure: figure,
        content: content,
        image: image && !image.includes('data:') ? null : image,
        status: 'draft'
    };

    if (currentEditingArticleId) {
        // UPDATE съществуваща статия
        AdminStorage.updateArticle(currentEditingArticleId, articleData);
        alert('Статията е обновена като чернова');
    } else {
        // CREATE нова статия
        AdminStorage.createArticle(articleData);
        alert('Статията е запазена като чернова');
    }

    resetForm();
    showView('articles');
}

// === ПУБЛИКУВАНЕ ===
function publishArticle() {
    if (!validateForm()) return;

    const title = document.getElementById('article-title').value.trim();
    const figure = document.getElementById('article-figure').value;
    const content = document.getElementById('article-content').value.trim();
    const image = document.getElementById('image-preview').src;

    const articleData = {
        title: title,
        figure: figure,
        content: content,
        image: image && !image.includes('data:') ? null : image,
        status: 'published'
    };

    if (currentEditingArticleId) {
        // UPDATE
        AdminStorage.updateArticle(currentEditingArticleId, articleData);
        alert('Статията е обновена и публикувана успешно!');
    } else {
        // CREATE
        AdminStorage.createArticle(articleData);
        alert('Статията е публикувана успешно!');
    }

    resetForm();
    showView('articles');
}

// === RESET ФОРМА ===
function resetForm() {
    currentEditingArticleId = null;
    
    document.getElementById('article-title').value = '';
    document.getElementById('article-figure').value = '';
    document.getElementById('article-content').value = '';
    document.getElementById('image-input').value = '';
    
    const preview = document.getElementById('image-preview');
    const placeholder = document.getElementById('upload-placeholder');
    const uploadArea = document.getElementById('image-upload');
    
    preview.src = '';
    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
    uploadArea.classList.remove('has-image');

    // Reset заглавието
    document.querySelector('#article-form-view .page-title').textContent = 'Нова статия';

    // Clear errors
    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error');
    });
    document.querySelectorAll('.form-error').forEach(error => {
        error.classList.add('hidden');
    });
}

// === DELETE MODAL ===
function initDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target.id === 'delete-modal') {
            hideDeleteModal();
        }
    });
}

function showDeleteModal() {
    document.getElementById('delete-modal').classList.add('active');
}

function hideDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
}

function confirmDelete() {
    if (!currentEditingArticleId) {
        hideDeleteModal();
        return;
    }

    const success = AdminStorage.deleteArticle(currentEditingArticleId);
    
    if (success) {
        alert('Статията е изтрита успешно');
        loadArticlesList();
        loadDashboard();
    } else {
        alert('Грешка при изтриване на статията');
    }

    currentEditingArticleId = null;
    hideDeleteModal();
}

// === LOGOUT (placeholder) ===
document.querySelector('.logout-btn')?.addEventListener('click', () => {
    if (confirm('Сигурни ли сте, че искате да излезете?')) {
        // TODO: Logout logic
        window.location.href = '../index.html';
    }
});


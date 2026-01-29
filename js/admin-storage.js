// === ADMIN STORAGE SYSTEM ===
// LocalStorage система за управление на статии

const AdminStorage = {
    STORAGE_KEY: 'zhivata_istoria_articles',
    
    // === ИНИЦИАЛИЗАЦИЯ ===
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            const initialData = {
                articles: [],
                nextId: 1
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
        }
    },

    // === GET DATA ===
    getData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : { articles: [], nextId: 1 };
    },

    // === SAVE DATA ===
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    // === CREATE - Създаване на нова статия ===
    createArticle(articleData) {
        const data = this.getData();
        
        const newArticle = {
            id: 'article_' + data.nextId,
            title: articleData.title,
            figure: articleData.figure,
            content: articleData.content,
            image: articleData.image || null,
            status: articleData.status || 'draft', // draft | published
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        data.articles.push(newArticle);
        data.nextId++;
        this.saveData(data);

        return newArticle;
    },

    // === READ - Получаване на всички статии ===
    getAllArticles() {
        const data = this.getData();
        return data.articles;
    },

    // === READ - Получаване на статия по ID ===
    getArticleById(id) {
        const data = this.getData();
        return data.articles.find(article => article.id === id);
    },

    // === READ - Получаване на статии по статус ===
    getArticlesByStatus(status) {
        const data = this.getData();
        if (status === 'all') return data.articles;
        return data.articles.filter(article => article.status === status);
    },

    // === UPDATE - Обновяване на статия ===
    updateArticle(id, updates) {
        const data = this.getData();
        const index = data.articles.findIndex(article => article.id === id);
        
        if (index === -1) return null;

        data.articles[index] = {
            ...data.articles[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveData(data);
        return data.articles[index];
    },

    // === DELETE - Изтриване на статия ===
    deleteArticle(id) {
        const data = this.getData();
        const index = data.articles.findIndex(article => article.id === id);
        
        if (index === -1) return false;

        data.articles.splice(index, 1);
        this.saveData(data);
        return true;
    },

    // === STATISTICS ===
    getStats() {
        const articles = this.getAllArticles();
        return {
            total: articles.length,
            published: articles.filter(a => a.status === 'published').length,
            drafts: articles.filter(a => a.status === 'draft').length
        };
    },

    // === CLEAR ALL (за тестване) ===
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.init();
    }
};

// Инициализация при зареждане
AdminStorage.init();
 // Navigation
        document.querySelectorAll('.admin-nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.dataset.view;
                
                document.querySelectorAll('.admin-nav-links a').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
                
                showView(view);
            });
        });

        // View Management
        function showView(viewName) {
            document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
            
            const viewElement = document.getElementById(viewName + '-view');
            if (viewElement) {
                viewElement.classList.remove('hidden');
            }
        }

        // Filter Management
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Image Upload
        document.getElementById('image-input').addEventListener('change', function(e) {
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

        // Form Validation
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

        function saveDraft() {
            const title = document.getElementById('article-title').value;
            const figure = document.getElementById('article-figure').value;
            const content = document.getElementById('article-content').value;
            
            if (!title && !figure && !content) {
                alert('Моля, попълнете поне едно поле преди да запазите');
                return;
            }
            
            alert('Статията е запазена като чернова');
            showView('articles');
        }

        function publishArticle() {
            if (validateForm()) {
                alert('Статията е публикувана успешно!');
                showView('articles');
            }
        }

        // Delete Modal
        function showDeleteModal() {
            document.getElementById('delete-modal').classList.add('active');
        }

        function hideDeleteModal() {
            document.getElementById('delete-modal').classList.remove('active');
        }

        function confirmDelete() {
            alert('Статията е изтрита');
            hideDeleteModal();
        }

        // Close modal on overlay click
        document.getElementById('delete-modal').addEventListener('click', (e) => {
            if (e.target.id === 'delete-modal') {
                hideDeleteModal();
            }
        });

        // Clear form errors on input
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
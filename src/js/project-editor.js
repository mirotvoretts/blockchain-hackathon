const API_BASE_URL = 'http://localhost:3001';
let projectId = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Получаем ID проекта из URL
    const urlParams = new URLSearchParams(window.location.search);
    projectId = urlParams.get('id');
    console.log("[Init] Project ID from URL:", projectId);

    // Элементы DOM
    const finalSaveBtn = document.getElementById('finalSaveBtn');
    const addUpdateItemBtn = document.getElementById('addUpdateItem');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageUploadInput = document.getElementById('imageUploadInput');
    const galleryContainer = document.getElementById('galleryContainer');
    const updatesContainer = document.getElementById('updatesContainer');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    // Фиксированное название проекта
    const projectTitle = "Помощь детям-сиротам";
    
    // Установка названия проекта в заголовок
    const projectTitleElement = document.querySelector('.form-group label[for="projectSubtitle"]');
    if (projectTitleElement) {
        projectTitleElement.textContent = `Проект "${projectTitle}"`;
    }
    
    // Данные проекта (по умолчанию)
    let projectData = {
        title: projectTitle,
        subtitle: "",
        description: "",
        end_date: new Date().toISOString().split('T')[0],
        team_info: "",
        link: "",
        gallery: [],
        updates: []
    };
    
    // Если есть ID проекта, загружаем данные с сервера
    if (projectId) {
        try {
            console.log("[API] Loading project data...");
            const response = await apiRequest(`/funds/${projectId}`, 'GET');
            
            // Преобразуем данные сервера в наш формат
            projectData = {
                title: response.title,
                subtitle: response.description, // Используем description как subtitle
                description: response.team_info, // Используем team_info как description
                end_date: response.target_date ? response.target_date.split('T')[0] : new Date().toISOString().split('T')[0],
                team_info: response.team_info || "",
                link: response.link || "",
                gallery: response.photo_url ? [response.photo_url] : [],
                updates: [] // Обновления пока не поддерживаются API
            };
            
            console.log("[API] Project data loaded:", projectData);
            
            // Обновляем название в заголовке
            if (projectTitleElement && projectData.title) {
                projectTitleElement.textContent = `Проект "${projectData.title}"`;
            }
        } catch (error) {
            console.error('[API] Error loading project:', error);
            showNotification('Ошибка загрузки проекта', 'error');
        }
    }
    
    // Инициализация формы
    function initForm() {
        // Заполняем поля данными проекта
        document.getElementById('projectSubtitle').value = projectData.subtitle;
        document.getElementById('projectDescription').value = projectData.description;
        document.getElementById('projectStartDate').value = projectData.end_date;
        document.getElementById('projectTeam').value = projectData.team_info;
        document.getElementById('projectLinks').value = projectData.link;
        
        // Отрисовка галереи
        renderGallery();
        
        // Отрисовка обновлений
        renderUpdates();
    }
    
    // Отрисовка галереи
    function renderGallery() {
        galleryContainer.innerHTML = '';
        
        projectData.gallery.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${image}" alt="Изображение проекта">
                <div class="overlay">
                    <button onclick="removeGalleryImage(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            galleryContainer.appendChild(galleryItem);
        });
        
        // Добавляем элемент для загрузки новых изображений
        if (projectData.gallery.length < 5) {
            const uploadItem = document.createElement('div');
            uploadItem.className = 'gallery-item';
            uploadItem.style.display = 'flex';
            uploadItem.style.alignItems = 'center';
            uploadItem.style.justifyContent = 'center';
            uploadItem.style.cursor = 'pointer';
            uploadItem.style.background = '#f0f0f0';
            uploadItem.innerHTML = `
                <div style="text-align: center; color: #666;">
                    <i class="fas fa-plus" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Добавить фото</p>
                </div>
            `;
            uploadItem.addEventListener('click', () => {
                imageUploadInput.click();
            });
            galleryContainer.appendChild(uploadItem);
        }
    }
    
    // Отрисовка обновлений проекта
    function renderUpdates() {
        updatesContainer.innerHTML = '';
        
        projectData.updates.forEach((update, index) => {
            const updateItem = document.createElement('div');
            updateItem.className = 'update-item';
            updateItem.innerHTML = `
                <button class="remove-btn" onclick="removeUpdateItem(${index})">
                    <i class="fas fa-times"></i>
                </button>
                <div class="form-group">
                    <label>Дата обновления</label>
                    <input type="date" class="form-control" 
                           value="${update.date}" data-index="${index}" data-field="date">
                </div>
                <div class="form-group">
                    <label>Заголовок</label>
                    <input type="text" class="form-control" 
                           value="${update.title}" data-index="${index}" data-field="title">
                </div>
                <div class="form-group">
                    <label>Текст обновления</label>
                    <textarea class="form-control" data-index="${index}" data-field="content">${update.content}</textarea>
                </div>
            `;
            updatesContainer.appendChild(updateItem);
        });
    }
    
    // Добавление обновления
    addUpdateItemBtn.addEventListener('click', () => {
        projectData.updates.push({
            date: new Date().toISOString().split('T')[0],
            title: "",
            content: ""
        });
        renderUpdates();
    });
    
    // Удаление обновления
    window.removeUpdateItem = function(index) {
        projectData.updates.splice(index, 1);
        renderUpdates();
    };
    
    // Загрузка изображений
    imageUploadArea.addEventListener('click', () => {
        imageUploadInput.click();
    });
    
    imageUploadInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            const file = files[0]; // Берем только первый файл
            if (file.type.startsWith('image/')) {
                try {
                    // Если есть ID проекта, загружаем на сервер
                    if (projectId) {
                        console.log("[API] Uploading image...");
                        const formData = new FormData();
                        formData.append('file', file);
                        
                        const response = await apiRequest(
                            `/funds/${projectId}/upload-photo`, 
                            'POST', 
                            formData,
                            false // Не отправлять как JSON
                        );
                        
                        console.log("[API] Image uploaded:", response);
                        projectData.gallery.push(response.photo_url);
                    } else {
                        // Локальное сохранение до создания проекта
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            projectData.gallery.push(event.target.result);
                        };
                        reader.readAsDataURL(file);
                    }
                    
                    renderGallery();
                    showNotification('Изображение успешно загружено', 'success');
                } catch (error) {
                    console.error('[API] Image upload error:', error);
                    showNotification('Ошибка загрузки изображения', 'error');
                }
            }
        }
        // Сброс значения input для возможности повторной загрузки тех же файлов
        imageUploadInput.value = '';
    });
    
    // Удаление изображения из галереи
    window.removeGalleryImage = function(index) {
        projectData.gallery.splice(index, 1);
        renderGallery();
    };
    
    // Сохранение проекта
    async function saveProject() {
        try {
            // Собираем данные из формы
            projectData.subtitle = document.getElementById('projectSubtitle').value;
            projectData.description = document.getElementById('projectDescription').value;
            projectData.end_date = document.getElementById('projectStartDate').value;
            projectData.team_info = document.getElementById('projectTeam').value;
            projectData.link = document.getElementById('projectLinks').value;
            
            // Собираем данные обновлений
            const updateInputs = document.querySelectorAll('#updatesContainer input, #updatesContainer textarea');
            updateInputs.forEach(input => {
                const index = parseInt(input.dataset.index);
                const field = input.dataset.field;
                if (!isNaN(index) && projectData.updates[index]) {
                    projectData.updates[index][field] = input.value;
                }
            });
            
            // Формируем данные для API
            const apiData = {
                title: projectData.title,
                description: projectData.subtitle, // Краткое описание
                team_info: projectData.description, // Полное описание
                target_date: `${projectData.end_date}T00:00:00Z`,
                link: projectData.link,
                // Остальные поля с значениями по умолчанию
                category_id: 1, // Дети
                target: 100, // Целевая сумма
                collected: 0,
                donate_count: 0,
                photo_url: projectData.gallery[0] || "", // Первое изображение
                location: "Москва, Россия"
            };
            
            // Отправляем данные на сервер
            let response;
            if (projectId) {
                // Обновление существующего проекта
                console.log("[API] Updating project...");
                response = await apiRequest(`/funds/${projectId}`, 'PATCH', apiData);
            } else {
                // Создание нового проекта
                console.log("[API] Creating project...");
                response = await apiRequest('/funds/', 'POST', apiData);
                projectId = response.id;
                // Обновляем URL с новым ID
                window.history.replaceState(null, null, `?id=${projectId}`);
            }
            
            console.log("[API] Project saved:", response);
            showNotification('Проект успешно сохранен!', 'success');
            
        } catch (error) {
            console.error('[API] Save error:', error);
            showNotification('Ошибка сохранения проекта', 'error');
        }
    }
    
    // Показ уведомления
    function showNotification(message, type) {
        if (notificationText) notificationText.textContent = message;
        if (notification) notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            if (notification) notification.classList.remove('show');
        }, 3000);
    }
    
    // Слушатели событий
    if (finalSaveBtn) {
        finalSaveBtn.addEventListener('click', saveProject);
    }
    
    // Обработчик изменений в обновлениях
    if (updatesContainer) {
        updatesContainer.addEventListener('input', (e) => {
            if (e.target.matches('input[data-index], textarea[data-index]')) {
                const index = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;
                if (!isNaN(index) && projectData.updates[index]) {
                    projectData.updates[index][field] = e.target.value;
                }
            }
        });
    }
    
    // Инициализация формы
    initForm();
});

// Функция для работы с API
async function apiRequest(endpoint, method = 'GET', body = null, isJson = true) {
    console.log(`[API] ${method} ${endpoint}`);
    
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {},
        credentials: 'include'
    };

    if (isJson && method !== 'GET') {
        options.headers['Content-Type'] = 'application/json';
    }
    
    if (body) {
        options.body = isJson ? JSON.stringify(body) : body;
    }
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`[API] Request to ${endpoint} failed:`, error);
        throw error;
    }
}
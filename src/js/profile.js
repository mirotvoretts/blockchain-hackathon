const API_BASE_URL = 'http://localhost:3001';
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');

// Функция для работы с API
async function apiRequest(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {},
        credentials: 'include'
    };

    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API request to ${endpoint} failed:`, error);
        throw error;
    }
}

async function getCurrentUser() {
    try {
        const user = await apiRequest('/auth/me');
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

async function loadUserProjects() {
    try {
        const projects = await apiRequest('/funds/my');
        return projects;
    } catch (error) {
        console.error('Error loading user projects:', error);
        return [];
    }
}

async function displayUserProjects() {
    const container = document.querySelector('#myProjectsSection .my-projects');
    if (!container) return;
    
    container.innerHTML = '<p class="loading">Загрузка ваших проектов...</p>';
    
    try {
        const projects = await loadUserProjects();
        
        if (projects.length === 0) {
            container.innerHTML = `
                <div class="no-projects">
                    <i class="fas fa-folder-open"></i>
                    <h3>У вас пока нет проектов</h3>
                    <p>Создайте свой первый проект для сбора средств</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        projects.forEach(project => {
            const progress = Math.min(Math.round((project.collected / project.target) * 100), 100);
            const status = project.status === 'active' ? 'Активный' : project.status === 'completed' ? 'Завершен' : 'На модерации';
            
            const projectCard = document.createElement('div');
            projectCard.className = 'user-project-card';
            projectCard.innerHTML = `
                <div class="project-header">
                    <h4>${project.title}</h4>
                    <span class="project-status ${project.status}">${status}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-value" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-info">
                        <span>Собрано: ${project.collected} ETH</span>
                        <span>Цель: ${project.target} ETH</span>
                    </div>
                </div>
                <div class="project-stats">
                    <div class="stat-item">
                        <i class="fas fa-donate"></i>
                        <span>${project.donate_count || 0} пожертвований</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-calendar"></i>
                        <span>${project.days_left || 0} дней осталось</span>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="btn btn-view" onclick="viewProject(${project.id})">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                </div>
            `;
            container.appendChild(projectCard);
        });
    } catch (error) {
        container.innerHTML = '<p class="error">Ошибка загрузки проектов. Попробуйте позже.</p>';
    }
}

window.viewProject = function(projectId) {
    window.location.href = `project-details.html?id=${projectId}`;
};

function initProjectsSection() {
    const addProjectBtn = document.createElement('button');
    addProjectBtn.id = 'addProjectBtn';
    addProjectBtn.className = 'btn-add-project';
    addProjectBtn.innerHTML = '<i class="fas fa-plus"></i> Добавить проект';
    addProjectBtn.addEventListener('click', openProjectModal);
    
    const projectsSection = document.getElementById('myProjectsSection');
    if (projectsSection) {
        projectsSection.querySelector('.my-projects').before(addProjectBtn);
    }
    
    const projectsLink = document.querySelector('.profile-menu a[data-section="my_projects"]');
    if (projectsLink) {
        projectsLink.addEventListener('click', displayUserProjects);
    }
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const projectData = {
        title: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        contact_name: document.getElementById('contactName').value,
        contact_email: document.getElementById('projectEmail').value,
        contact_phone: document.getElementById('projectPhone').value,
        website: document.getElementById('projectLink').value || null,
        category_id: 1, // Категория по умолчанию
        target: 10 // Цель по умолчанию (10 ETH)
    };
    
    const submitBtn = document.getElementById('submitProjectBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    
    try {
        await apiRequest('/funds/', 'POST', projectData);
        alert('Проект успешно создан и отправлен на модерацию!');
        projectForm.reset();
        closeProjectModal();
        displayUserProjects();
    } catch (error) {
        console.error('Create project error:', error);
        alert(`Ошибка создания проекта: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Отправить заявку';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    const isDark = document.body.classList.contains('dark-theme');
    const icon = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    if (themeToggle) themeToggle.innerHTML = icon;
    if (mobileThemeToggle) mobileThemeToggle.innerHTML = icon;
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = '<i class="fas fa-sun"></i>';
        if (themeToggle) themeToggle.innerHTML = icon;
        if (mobileThemeToggle) mobileThemeToggle.innerHTML = icon;
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    if (!mobileMenu || !mobileMenuBtn) return;
    
    const isActive = !mobileMenu.classList.contains('active');
    mobileMenu.classList.toggle('active', isActive);
    mobileMenuBtn.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : 'auto';
}

function setupMobileMenuLinks() {
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMobileMenu();
        });
    });
}
    
const projectModal = document.getElementById('projectModal');

function openProjectModal() {
    if (projectModal) {
        projectModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeProjectModal() {
    if (projectModal) {
        projectModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function checkFormValidity() {
    const projectForm = document.getElementById('projectForm');
    const submitProjectBtn = document.getElementById('submitProjectBtn');
    
    if (!projectForm || !submitProjectBtn) return;
    
    const requiredFields = projectForm.querySelectorAll('[required]');
    submitProjectBtn.disabled = !Array.from(requiredFields).every(field => 
        field.value.trim() !== ''
    );
}

function initSmoothScroll() {
    const mobileMenu = document.getElementById('mobileMenu');
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
                
                targetElement.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, targetId);
            }
        });
    });
}

let isScrolling = false;
function animateOnScroll() {
    if (isScrolling) return;
    
    isScrolling = true;
    requestAnimationFrame(() => {
        const fadeElements = document.querySelectorAll('.fade-in:not(.appear)');
        const windowHeight = window.innerHeight;
        
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - 100) {
                element.classList.add('appear');
            }
        });
        
        isScrolling = false;
    });
}

function setupProfileSections() {
    const menuLinks = document.querySelectorAll('.profile-menu a');
    const sections = document.querySelectorAll('.profile-section');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            menuLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
            
            sections.forEach(section => section.classList.remove('active'));
            
            const sectionId = link.getAttribute('data-section') + 'Section';
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

function setupAvatarUpload() {
    const avatarUpload = document.getElementById('avatarUpload');
    const avatarInput = document.getElementById('avatarInput');
    const avatarImage = document.getElementById('avatarImage');
    
    if (!avatarUpload || !avatarInput || !avatarImage) return;
    
    avatarUpload.addEventListener('click', () => {
        avatarInput.click();
    });
    
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                avatarImage.src = event.target.result;
                localStorage.setItem('userAvatar', event.target.result);
            }
            reader.readAsDataURL(file);
        }
    });
    
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        avatarImage.src = savedAvatar;
    }
}

function setupSaveProfile() {
    const saveBtn = document.getElementById('saveProfile');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    
    if (!saveBtn || !nameInput || !emailInput || !phoneInput) return;
    
    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    if (savedProfile.name) nameInput.value = savedProfile.name;
    if (savedProfile.email) emailInput.value = savedProfile.email;
    if (savedProfile.phone) phoneInput.value = savedProfile.phone;
    
    if (profileName) profileName.textContent = savedProfile.name || 'Имя пользователя';
    if (profileEmail) profileEmail.textContent = savedProfile.email || 'email@example.com';
    if (profilePhone) profilePhone.textContent = savedProfile.phone || 'Телефон не указан';
    
    saveBtn.addEventListener('click', () => {
        const profileData = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value
        };
        
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        
        if (profileName) profileName.textContent = profileData.name;
        if (profileEmail) profileEmail.textContent = profileData.email;
        if (profilePhone) profilePhone.textContent = profileData.phone || 'Телефон не указан';
        
        alert('Изменения профиля сохранены!');
    });
}

function setupProfileEdit() {
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfile');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const profileSection = document.getElementById('profileSection');
    const editSection = document.getElementById('editSection');
    
    if (!editBtn || !saveBtn || !cancelBtn) return;
    loadProfileData();
    
    editBtn.addEventListener('click', () => {
        profileSection.style.display = 'none';
        editSection.style.display = 'block';
        
        document.getElementById('nameEdit').value = document.getElementById('nameView').textContent;
        document.getElementById('emailEdit').value = document.getElementById('emailView').textContent;
        document.getElementById('phoneEdit').value = document.getElementById('phoneView').textContent;
    });
    
    cancelBtn.addEventListener('click', () => {
        editSection.style.display = 'none';
        profileSection.style.display = 'block';
    });
    
    saveBtn.addEventListener('click', () => {
        const name = document.getElementById('nameEdit').value;
        const email = document.getElementById('emailEdit').value;
        const phone = document.getElementById('phoneEdit').value;
        
        document.getElementById('nameView').textContent = name;
        document.getElementById('emailView').textContent = email;
        document.getElementById('phoneView').textContent = phone;
        
        document.getElementById('profileName').textContent = name;
        document.getElementById('profileEmail').textContent = email || 'Почта не указана';
        document.getElementById('profilePhone').textContent = phone || 'Телефон не указан';
        
        const profileData = {
            name: name,
            email: email,
            phone: phone
        };
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        
        editSection.style.display = 'none';
        profileSection.style.display = 'block';
        
        alert('Изменения сохранены успешно!');
    });
}

function loadProfileData() {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    
    if (savedProfile) {
        document.getElementById('nameView').textContent = savedProfile.name;
        document.getElementById('emailView').textContent = savedProfile.email || 'Почта не указана';
        document.getElementById('phoneView').textContent = savedProfile.phone || 'Телефон не указан';
        
        document.getElementById('profileName').textContent = savedProfile.name;
        document.getElementById('profileEmail').textContent = savedProfile.email|| 'Почта не указана';
        document.getElementById('profilePhone').textContent = savedProfile.phone || 'Телефон не указан';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    setupMobileMenuLinks();
    
    const projectModal = document.getElementById('projectModal');
    const closeProjectModalBtn = document.getElementById('closeProjectModal');
    const projectForm = document.getElementById('projectForm');
    
    if (closeProjectModalBtn) closeProjectModalBtn.addEventListener('click', closeProjectModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === projectModal) closeProjectModal();
    });
    
    if (projectForm) {
        projectForm.addEventListener('input', checkFormValidity);
        projectForm.addEventListener('submit', handleProjectSubmit);
        checkFormValidity(); 
    }
    
    initSmoothScroll();
    animateOnScroll(); 
    setupProfileSections();
    setupProfileEdit();
    setupAvatarUpload();
    setupSaveProfile();
    
    window.addEventListener('scroll', animateOnScroll, { passive: true });
    
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) target.scrollIntoView();
        }, 100);
    }

    initProjectsSection();
    
    if (document.querySelector('.profile-menu a[data-section="my_projects"]').classList.contains('active')) {
        displayUserProjects();
    }
});
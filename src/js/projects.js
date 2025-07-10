const API_BASE_URL = '/api';

function getAuthToken() {
    return localStorage.getItem('authToken');
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const token = getAuthToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (body) {
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

async function loadProjects() {
    try {
        const data = await apiRequest('/funds/');
        return data;
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

async function loadCategories() {
    return {
        children: "Дети",
        health: "Здоровье",
        animals: "Животные",
        education: "Образование",
        ecology: "Экология",
        social: "Социальная помощь"
    };
}

async function donateToFund(fundId, amount, name) {
    try {
        const response = await apiRequest(`/funds/${fundId}/donate`, 'POST', {
            amount: amount,
            name: name
        });
        return response;
    } catch (error) {
        console.error('Donation error:', error);
        throw error;
    }
}

async function createFund(fundData) {
    try {
        const response = await apiRequest('/funds/', 'POST', fundData);
        return response;
    } catch (error) {
        console.error('Create fund error:', error);
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

let categories = {};
let projects = [];
let currentFilter = {
    search: "",
    category: "all",
    urgentOnly: false
};

function generateProjectCards(filteredProjects) {
    const projectsGrid = document.getElementById('projectsGrid');
    projectsGrid.innerHTML = '';
    
    if (filteredProjects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search fa-3x" style="margin-bottom: 20px;"></i>
                <h3>Проекты не найдены</h3>
                <p>Попробуйте изменить параметры поиска</p>
            </div>
        `;
        return;
    }
    
    filteredProjects.forEach(project => {
        const progress = Math.min(Math.round((project.collected / project.goal) * 100), 100);
        const categoryName = categories[project.category] || project.category;
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <img src="${project.image_url || '../img/default-project.png'}" alt="${project.title}" class="project-image">
            <div class="project-content">
                <span class="project-category">${categoryName}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Собрано: ${(project.collected || 0).toLocaleString()} ₽</span>
                        <span>Цель: ${(project.goal || 0).toLocaleString()} ₽</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-value" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="project-stats">
                    <div class="stat-item">
                        <div class="stat-value">${progress}%</div>
                        <div class="stat-label">Прогресс</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${project.donations_count || 0}</div>
                        <div class="stat-label">Пожертвований</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${project.days_left || 0}</div>
                        <div class="stat-label">Дней осталось</div>
                    </div>
                </div>
                
                <div class="project-buttons">
                    <button class="btn btn-details" onclick="viewProjectDetails(${project.id})">
                        <i class="fas fa-info-circle"></i> Подробнее
                    </button>
                    <button class="btn btn-donate" onclick="openDonationModal(${project.id})">
                        <i class="fas fa-hand-holding-heart"></i> Пожертвовать
                    </button>
                </div>
            </div>
        `;
        
        projectsGrid.appendChild(projectCard);
    });
    
    document.getElementById('projectsCount').textContent = filteredProjects.length;
}

function filterProjects() {
    return projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(currentFilter.search.toLowerCase());        
        const matchesCategory = currentFilter.category === "all" || project.category === currentFilter.category;
        
        return matchesSearch && matchesCategory;
    });
}

function applyFilters() {
    const filteredProjects = filterProjects();
    generateProjectCards(filteredProjects);
}

function initFilters() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        currentFilter.search = e.target.value;
        applyFilters();
    });
    
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter.category = button.dataset.category;
            applyFilters();
        });
    });
    
    document.querySelector('.category-btn[data-category="all"]').classList.add('active');
}

function viewProjectDetails(projectId) {
    // Переход на страницу проекта
    window.location.href = `project.html?id=${projectId}`;
}

const donationModal = document.getElementById('donationModal');

function openDonationModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    document.getElementById('donationProjectTitle').textContent = project.title;
    document.getElementById('donationProjectCategory').textContent = categories[project.category] || project.category;
    document.getElementById('donationCollected').textContent = (project.collected || 0).toLocaleString() + ' ₽';
    document.getElementById('donationGoal').textContent = (project.goal || 0).toLocaleString() + ' ₽';
    document.getElementById('donationProjectId').value = project.id;
    
    const progress = Math.min(Math.round(((project.collected || 0) / project.goal) * 100), 100);
    document.getElementById('donationProgress').style.width = progress + '%';
    
    if (donationModal) {
        donationModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

async function handleDonationSubmit(e) {
    e.preventDefault();
    
    const projectId = parseInt(document.getElementById('donationProjectId').value);
    const amount = parseFloat(document.getElementById('donationAmount').value);
    const name = document.getElementById('donatorName').value;
    
    if (!projectId || isNaN(amount) || !name) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    if (amount < 100) {
        alert('Минимальная сумма пожертвования - 100 рублей');
        return;
    }
    
    try {
        const response = await donateToFund(projectId, amount, name);
        
        const projectIndex = projects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
            projects[projectIndex].collected += amount;
            projects[projectIndex].donations_count = (projects[projectIndex].donations_count || 0) + 1;
            applyFilters();
        }
        
        alert(`Спасибо, ${name}! Ваше пожертвование в размере ${amount.toLocaleString()} ₽ успешно зарегистрировано.`);
        
        closeDonationModal();
        e.target.reset();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

function closeDonationModal() {
    if (donationModal) {
        donationModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');

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
    const submitProjectBtn = document.getElementById('submitProjectBtn');
    if (!projectForm || !submitProjectBtn) return;
    
    const requiredFields = projectForm.querySelectorAll('[required]');
    submitProjectBtn.disabled = !Array.from(requiredFields).every(field => 
        field.value.trim() !== ''
    );
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const projectData = {
        title: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        category: document.getElementById('projectCategory').value,
        goal: parseFloat(document.getElementById('projectGoal').value),
        image_url: document.getElementById('projectImage').value || null,
        contact_name: document.getElementById('contactName').value,
        contact_email: document.getElementById('projectEmail').value,
        contact_phone: document.getElementById('projectPhone').value,
        website: document.getElementById('projectLink').value || null
    };
    
    try {
        const response = await createFund(projectData);
        
        alert('Проект успешно создан и отправлен на модерацию!');
        projectForm.reset();
        closeProjectModal();
        
        projects = await loadProjects();
        applyFilters();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}




const closeModalBtn = document.getElementById('closeModal');
const submitProjectBtn = document.getElementById('submitProjectBtn');


const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');

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
    }
    
    const icon = document.body.classList.contains('dark-theme') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    
    if (themeToggle) themeToggle.innerHTML = icon;
    if (mobileThemeToggle) mobileThemeToggle.innerHTML = icon;
}

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMobileMenu() {
    if (!mobileMenuBtn || !mobileMenu) return;
    
    const isActive = !mobileMenu.classList.contains('active');
    mobileMenu.classList.toggle('active', isActive);
    mobileMenuBtn.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : 'auto';
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Закрытие мобильного меню
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

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });
}


document.addEventListener('DOMContentLoaded', async () => {
    categories = await loadCategories();
    projects = await loadProjects();
    
    generateProjectCards(projects);
    initTheme();
    initFilters();
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        const addProjectBtn = document.getElementById('addProject');
        if (addProjectBtn) addProjectBtn.style.display = 'none';
    }
    
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeDonationModal);
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        
        const mobileLinks = document.querySelectorAll('.mobile-menu a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleMobileMenu();
            });
        });
    }

    const closeProjectModalBtn = document.getElementById('closeProjectModal');
    const closeDonationModalBtn = document.getElementById('closeDonationModal');

    if (closeDonationModalBtn) closeDonationModalBtn.addEventListener('click', closeDonationModal);
    if (closeProjectModalBtn) closeProjectModalBtn.addEventListener('click', closeProjectModal);

    window.addEventListener('click', (e) => {
        if (donationModal && e.target === donationModal) closeDonationModal();
        if (projectModal && e.target === projectModal) closeProjectModal();
    });

    if (projectForm) {
        projectForm.addEventListener('input', checkFormValidity);
        projectForm.addEventListener('submit', handleProjectSubmit);
        checkFormValidity();
    }

    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationSubmit);
    }
    
    const addProjectBtn = document.getElementById('addProject');
    if (addProjectBtn) addProjectBtn.addEventListener('click', openProjectModal);
    
    initSmoothScroll();
    animateOnScroll();

    window.addEventListener('scroll', animateOnScroll, { passive: true });
    
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) target.scrollIntoView();
        }, 100);
    }
    
    const progressBars = document.querySelectorAll('.progress-value');
    if (progressBars.length > 0) {
        window.addEventListener('scroll', () => {
            progressBars.forEach(bar => {
                const rect = bar.getBoundingClientRect();
                if (rect.top < window.innerHeight - 50) {
                    bar.style.transition = 'width 1.5s ease-in-out';
                }
            });
        });
    }
});
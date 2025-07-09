const projects = [
    {
        id: 1,
        title: "Помощь детям-сиротам",
        category: "children",
        description: "Обеспечение детей-сирот одеждой, учебными принадлежностями и психологической поддержкой.",
        image: "https://images.unsplash.com/photo-1491895200222-0f4d0d0a1cae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        collected: 125000,
        goal: 300000,
        donations: 347,
        daysLeft: 15,
        urgent: false
    },
    {
        id: 2,
        title: "Лечение тяжелобольных",
        category: "health",
        description: "Сбор средств на дорогостоящее лечение и реабилитацию для пациентов с онкологическими заболеваниями.",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        collected: 780000,
        goal: 1200000,
        donations: 892,
        daysLeft: 42,
        urgent: false
    },
    {
        id: 3,
        title: "Защита животных",
        category: "animals",
        description: "Строительство нового приюта для бездомных животных и программа стерилизации для контроля популяции.",
        image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        collected: 210000,
        goal: 500000,
        donations: 521,
        daysLeft: 28,
        urgent: true
    },
    {
        id: 4,
        title: "Образование для всех",
        category: "education",
        description: "Обеспечение удалённых школ современным оборудованием и доступом к качественным образовательным ресурсам.",
        image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        collected: 430000,
        goal: 800000,
        donations: 621,
        daysLeft: 60,
        urgent: false
    },
    {
        id: 5,
        title: "Экологическая инициатива",
        category: "ecology",
        description: "Посадка 10,000 деревьев в пострадавших от пожаров регионах и создание экологических троп.",
        image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        collected: 150000,
        goal: 350000,
        donations: 278,
        daysLeft: 22,
        urgent: true
    },
    {
        id: 6,
        title: "Поддержка пожилых людей",
        category: "social",
        description: "Программа доставки продуктов и лекарств, а также социального сопровождения для одиноких пожилых людей.",
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        collected: 89000,
        goal: 200000,
        donations: 156,
        daysLeft: 10,
        urgent: true
    }
];

const categories = {
    children: "Дети",
    health: "Здоровье",
    animals: "Животные",
    education: "Образование",
    ecology: "Экология",
    social: "Социальная помощь"
};

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
        const categoryName = categories[project.category];
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <img src="${project.image}" alt="${project.title}" class="project-image">
            <div class="project-content">
                <span class="project-category">${categoryName}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Собрано: ${(project.collected).toLocaleString()} ₽</span>
                        <span>Цель: ${(project.goal).toLocaleString()} ₽</span>
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
                        <div class="stat-value">${project.donations}</div>
                        <div class="stat-label">Пожертвований</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${project.daysLeft}</div>
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
    alert(`Переход на страницу проекта #${projectId}\nВ реальном приложении здесь будет загрузка детальной страницы проекта.`);
    // что-то типа window.location.href = `project.html?id=${projectId}`;
}

const donationModal = document.getElementById('donationModal');
const closeModalBtn = document.getElementById('closeModal');

function openDonationModal(projectId) {
    donationModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDonationModal() {
    donationModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
const submitProjectBtn = document.getElementById('submitProjectBtn');
const closeProjectModalBtn = document.getElementById('closeProjectModal');

function openProjectModal() {
    projectModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    projectModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function checkFormValidity() {
    const requiredFields = projectForm.querySelectorAll('[required]');
    let allFilled = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            allFilled = false;
        }
    });
    
    submitProjectBtn.disabled = !allFilled;
}

function handleProjectSubmit(e) {
    e.preventDefault();
    
    alert('Заявка успешно отправлена! Наши модераторы рассмотрят ее в ближайшее время.');

    projectForm.reset();
    submitProjectBtn.disabled = true;
    closeProjectModal();
}

const themeToggle = document.getElementById('themeToggle');

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        if (mobileThemeToggle) mobileThemeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
}

document.addEventListener('DOMContentLoaded', () => {
    generateProjectCards(projects);
    initTheme();
    initFilters();
    
    themeToggle.addEventListener('click', toggleTheme);
    
    closeModalBtn.addEventListener('click', closeDonationModal);
    
    const progressBars = document.querySelectorAll('.progress-value');
    window.addEventListener('scroll', () => {
        progressBars.forEach(bar => {
            const rect = bar.getBoundingClientRect();
            if (rect.top < window.innerHeight - 50) {
                bar.style.transition = 'width 1.5s ease-in-out';
            }
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === donationModal) closeDonationModal();
        if (e.target === projectModal) closeProjectModal();
    });
    
    const addProjectBtn = document.getElementById('addProject');
    if (addProjectBtn) addProjectBtn.addEventListener('click', openProjectModal);
    
    if (closeProjectModalBtn) closeProjectModalBtn.addEventListener('click', closeProjectModal);
    
    if (projectForm) {
        const inputs = projectForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', checkFormValidity);
        });
        
        projectForm.addEventListener('submit', handleProjectSubmit);
    }
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }
});
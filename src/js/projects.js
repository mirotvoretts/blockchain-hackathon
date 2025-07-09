const projects = [
    {
        id: 1,
        title: "Помощь детям-сиротам",
        category: "children",
        description: "Обеспечение детей-сирот одеждой, учебными принадлежностями и психологической поддержкой.",
        image: "../img/children.png",
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
        image: "../img/doctor.png",
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
        image: "../img/animal.png",
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
        image: "../img/education.png",
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
        image: "../img/ecology.png",
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
        image: "../img/senior.png",
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
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    document.getElementById('donationProjectTitle').textContent = project.title;
    document.getElementById('donationProjectCategory').textContent = categories[project.category];
    document.getElementById('donationCollected').textContent = project.collected.toLocaleString() + ' ₽';
    document.getElementById('donationGoal').textContent = project.goal.toLocaleString() + ' ₽';
    document.getElementById('donationProjectId').value = project.id;
    
    const progress = Math.min(Math.round((project.collected / project.goal) * 100), 100);
    document.getElementById('donationProgress').style.width = progress + '%';
    
    if (donationModal) {
        donationModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function handleDonationSubmit(e) {
    e.preventDefault();
    
    const projectId = parseInt(document.getElementById('donationProjectId').value);
    const amount = parseInt(document.getElementById('donationAmount').value);
    const name = document.getElementById('donatorName').value;
    
    if (!projectId || isNaN(amount) || !name) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    if (amount < 100) {
        alert('Минимальная сумма пожертвования - 100 рублей');
        return;
    }
    
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
        alert('Проект не найден');
        return;
    }
    
    try {
        projects[projectIndex].collected += amount;
        projects[projectIndex].donations += 1;
        
        closeDonationModal();
        
        e.target.reset();
        
        applyFilters();
        
        alert(`Спасибо, ${name}! Ваше пожертвование в размере ${amount.toLocaleString()} ₽ успешно зарегистрировано.`);
    } catch (error) {
        console.error('Ошибка при обработке пожертвования:', error);
        alert('Произошла ошибка при обработке пожертвования. Пожалуйста, попробуйте позже.');
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
const submitProjectBtn = document.getElementById('submitProjectBtn');

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
    if (!projectForm || !submitProjectBtn) return;
    
    const requiredFields = projectForm.querySelectorAll('[required]');
    submitProjectBtn.disabled = !Array.from(requiredFields).every(field => 
        field.value.trim() !== ''
    );
}

function handleProjectSubmit(e) {
    e.preventDefault();
    
    try {
        alert('Заявка успешно отправлена! Наши модераторы рассмотрят ее в ближайшее время.');
        e.target.reset();
        closeProjectModal();
    } catch (error) {
        console.error('Ошибка отправки:', error);
        alert('Произошла ошибка при отправке');
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    generateProjectCards(projects);
    initTheme();
    initFilters();
    
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
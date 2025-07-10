const API_BASE_URL = 'http://localhost:3001';
console.log("API_BASE_URL:", API_BASE_URL);

async function apiRequest(endpoint, method = 'GET', body = null) {
    console.log(`API Request: ${method} ${endpoint}`);
    const url = `${API_BASE_URL}${endpoint}`;
    console.log("Full URL:", url);
    
    const options = {
        method,
        headers: {
        },
        credentials: 'include'
    };

    if (method !== 'GET') {
        options.headers['Content-Type'] = 'application/json';
    }
    
    if (body) {
        console.log("Request body:", body);
        options.body = JSON.stringify(body);
    }
    
    console.log("Request options:", options);
    
    try {
        console.log("Sending request...");
        const response = await fetch(url, options);
        console.log("Response received. Status:", response.status);
        
        if (!response.ok) {
            console.log("Response not OK. Trying to parse error...");
            const errorData = await response.json();
            console.error("Error data:", errorData);
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        console.log("Parsing response JSON...");
        const data = await response.json();
        console.log("Response data:", data);
        return data;
    } catch (error) {
        console.error(`API request to ${endpoint} failed:`, error);
        throw error;
    }
}

async function loadProjects() {
    console.log("Loading projects...");
    try {
        const data = await apiRequest('/funds/');
        console.log("Projects loaded:", data.length);
        return data;
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

async function donateToFund(fundId, amount, name) {
    console.log(`Donating to fund ${fundId}: ${amount} ETH by ${name}`);
    try {
        const response = await apiRequest(`/funds/${fundId}/donate`, 'POST', {
            amount: amount,
            name: name
        });
        console.log("Donation successful. Response:", response);
        return response;
    } catch (error) {
        console.error('Donation error:', error);
        throw error;
    }
}

async function createFund(fundData) {
    console.log("Creating fund:", fundData);
    try {
        const response = await apiRequest('/funds/', 'POST', fundData);
        console.log("Fund created. Response:", response);
        return response;
    } catch (error) {
        console.error('Create fund error:', error);
        throw error;
    }
}

async function getCurrentUser() {
    console.log("Getting current user...");
    try {
        const user = await apiRequest('/auth/me');
        console.log("Current user:", user);
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

const categories = { 
    1: "Дети",
    2: "Здоровье",
    3: "Животные",
    4: "Образование",
    5: "Экология",
    6: "Социальная помощь" 
};
console.log("Categories mapping:", categories);

const eng_categories = { 
    all: 0,
    children: 1,
    health: 2,
    animals: 3,
    education: 4,
    ecology: 5,
    social: 6 
};
console.log("English categories mapping:", eng_categories);

let projects = [];
console.log("Projects array initialized:", projects);

let currentFilter = {
    search: "",
    category_id: 0
};
console.log("Initial filter:", currentFilter);

function generateProjectCards(filteredProjects) {
    console.log("Generating project cards. Count:", filteredProjects.length);
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (!projectsGrid) {
        console.error("projectsGrid element not found!");
        return;
    }
    
    projectsGrid.innerHTML = '';
    
    if (filteredProjects.length === 0) {
        console.log("No projects found. Showing no-results message");
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
        console.log("Rendering project:", project.id, project.title);
        const progress = Math.min(Math.round((project.collected / project.target) * 100), 100);
        console.log(`Progress for ${project.title}: ${progress}%`);
        
        const categoryName = categories[project.category_id] || `Unknown (${project.category_id})`;
        console.log("Category name:", categoryName);
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <img src="${API_BASE_URL}/uploads/${project.id}.png" class="project-image">
            <div class="project-content">
                <span class="project-category">${categoryName}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Собрано: ${(project.collected || 0).toLocaleString()} ETH</span>
                        <span>Цель: ${(project.target || 0).toLocaleString()} ETH</span>
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
                        <div class="stat-value">${project.donate_count || 0}</div>
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
                </div>
            </div>
        `;
        
        projectsGrid.appendChild(projectCard);
    });
    
    const projectsCountElement = document.getElementById('projectsCount');
    if (projectsCountElement) {
        projectsCountElement.textContent = filteredProjects.length;
        console.log("Projects count updated:", filteredProjects.length);
    } else {
        console.error("projectsCount element not found!");
    }
}

function filterProjects() {
    console.log("Filtering projects. Search:", currentFilter.search, "Category:", currentFilter.category_id);
    const filtered = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(currentFilter.search.toLowerCase());
        const matchesCategory = currentFilter.category_id === 0 || project.category_id === currentFilter.category_id;
        
        console.log(`Project ${project.id}: search=${matchesSearch}, category=${matchesCategory}`);
        return matchesSearch && matchesCategory;
    });
    
    console.log("Filtered projects count:", filtered.length);
    return filtered;
}

function applyFilters() {
    console.log("Applying filters...");
    const filteredProjects = filterProjects();
    generateProjectCards(filteredProjects);
}

function initFilters() {
    console.log("Initializing filters...");
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
        console.error("searchInput element not found!");
        return;
    }
    
    searchInput.addEventListener('input', (e) => {
        console.log("Search input changed:", e.target.value);
        currentFilter.search = e.target.value;
        applyFilters();
    });
    
    const categoryButtons = document.querySelectorAll('.category-btn');
    console.log("Category buttons found:", categoryButtons.length);
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            console.log("Category button clicked:", category);
            
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentFilter.category_id = eng_categories[category];
            console.log("Current category set to:", currentFilter.category_id);
            
            applyFilters();
        });
    });
    
    const allButton = document.querySelector('.category-btn[data-category="all"]');
    if (allButton) {
        allButton.classList.add('active');
        console.log("'All' category button activated");
    } else {
        console.error("'All' category button not found!");
    }
}

window.viewProjectDetails = function(projectId) {
    console.log("Viewing project details:", projectId);
    window.location.href = `project-details.html?id=${projectId}`;
};

const donationModal = document.getElementById('donationModal');
console.log("Donation modal:", donationModal ? "found" : "not found");

function openDonationModal(projectId) {
    console.log("Opening donation modal for project:", projectId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
        console.error("Project not found:", projectId);
        return;
    }
    
    console.log("Project found:", project);
    
    // Обновляем элементы модального окна
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            console.log(`Updated ${id}:`, value);
        } else {
            console.error(`Element not found: ${id}`);
        }
    };
    
    updateElement('donationProjectTitle', project.title);
    updateElement('donationCategory', categories[project.category_id] || project.category_id);
    updateElement('donationCollected', (project.collected || 0).toLocaleString() + ' ETH');
    updateElement('donationTarget', (project.target || 0).toLocaleString() + ' ETH');
    
    const progress = Math.min(Math.round(((project.collected || 0) / project.target) * 100), 100);
    const progressElement = document.getElementById('donationProgress');
    if (progressElement) {
        progressElement.style.width = progress + '%';
        console.log("Progress updated:", progress + '%');
    } else {
        console.error("Progress element not found");
    }
    
    const projectIdElement = document.getElementById('donationProjectId');
    if (projectIdElement) {
        projectIdElement.value = project.id;
        console.log("Project ID set:", project.id);
    } else {
        console.error("Project ID element not found");
    }
    
    if (donationModal) {
        donationModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log("Donation modal displayed");
    }
}

async function handleDonationSubmit(e) {
    console.log("Handling donation submit...");
    e.preventDefault();
    
    const projectId = parseInt(document.getElementById('donationProjectId').value);
    const amount = parseFloat(document.getElementById('donationAmount').value);
    const name = document.getElementById('donatorName').value;
    
    console.log("Donation data:", { projectId, amount, name });
    
    if (!projectId || isNaN(amount) || !name) {
        const errorMsg = 'Пожалуйста, заполните все обязательные поля';
        console.error(errorMsg);
        alert(errorMsg);
        return;
    }
    
    if (amount < 0.1) {
        const errorMsg = 'Минимальная сумма пожертвования - 0.1 ETH';
        console.error(errorMsg);
        alert(errorMsg);
        return;
    }
    
    try {
        console.log("Processing donation...");
        const response = await donateToFund(projectId, amount, name);
        
        const projectIndex = projects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
            projects[projectIndex].collected += amount;
            projects[projectIndex].donate_count = (projects[projectIndex].donate_count || 0) + 1;
            console.log("Project data updated:", projects[projectIndex]);
            applyFilters();
        }
        
        const successMsg = `Спасибо, ${name}! Ваше пожертвование в размере ${amount.toLocaleString()} ETH успешно зарегистрировано.`;
        console.log(successMsg);
        alert(successMsg);
        
        closeDonationModal();
        e.target.reset();
    } catch (error) {
        const errorMsg = `Ошибка: ${error.message}`;
        console.error(errorMsg, error);
        alert(errorMsg);
    }
}

function closeDonationModal() {
    console.log("Closing donation modal");
    if (donationModal) {
        donationModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

const projectModal = document.getElementById('projectModal');
console.log("Project modal:", projectModal ? "found" : "not found");

const projectForm = document.getElementById('projectForm');
console.log("Project form:", projectForm ? "found" : "not found");

function openProjectModal() {
    console.log("Opening project modal");
    if (projectModal) {
        projectModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeProjectModal() {
    console.log("Closing project modal");
    if (projectModal) {
        projectModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function checkFormValidity() {
    console.log("Checking form validity...");
    const submitProjectBtn = document.getElementById('submitProjectBtn');
    
    if (!projectForm || !submitProjectBtn) {
        console.error("Form or submit button not found");
        return;
    }
    
    const requiredFields = projectForm.querySelectorAll('[required]');
    const allValid = Array.from(requiredFields).every(field => 
        field.value.trim() !== ''
    );
    
    submitProjectBtn.disabled = !allValid;
    console.log("Form validity:", allValid, "Submit button disabled:", submitProjectBtn.disabled);
}

async function handleProjectSubmit(e) {
    console.log("Handling project submit...");
    e.preventDefault();
    
    const projectData = {
        title: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        category_id: eng_categories[document.getElementById('projectCategory').value],
        target: parseFloat(document.getElementById('projectGoal').value),
        photo_url: document.getElementById('projectImage').value || null,
        contact_name: document.getElementById('contactName').value,
        contact_email: document.getElementById('projectEmail').value,
        contact_phone: document.getElementById('projectPhone').value,
        website: document.getElementById('projectLink').value || null
    };
    
    console.log("Project data:", projectData);
    
    try {
        const response = await createFund(projectData);
        console.log("Project created response:", response);
        
        const successMsg = 'Проект успешно создан и отправлен на модерацию!';
        console.log(successMsg);
        alert(successMsg);
        
        projectForm.reset();
        closeProjectModal();
        
        console.log("Reloading projects...");
        projects = await loadProjects();
        applyFilters();
    } catch (error) {
        const errorMsg = `Ошибка: ${error.message}`;
        console.error(errorMsg, error);
        alert(errorMsg);
    }
}

console.log("Initializing theme toggle...");
const themeToggle = document.getElementById('themeToggle');
console.log("Theme toggle:", themeToggle ? "found" : "not found");

const mobileThemeToggle = document.getElementById('mobileThemeToggle');
console.log("Mobile theme toggle:", mobileThemeToggle ? "found" : "not found");

function toggleTheme() {
    console.log("Toggling theme...");
    document.body.classList.toggle('dark-theme');
    
    const isDark = document.body.classList.contains('dark-theme');
    console.log("Dark theme:", isDark);
    
    const icon = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    if (themeToggle) {
        themeToggle.innerHTML = icon;
        console.log("Desktop theme icon updated");
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.innerHTML = icon;
        console.log("Mobile theme icon updated");
    }
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    console.log("Theme saved to localStorage");
}

function initTheme() {
    console.log("Initializing theme...");
    const savedTheme = localStorage.getItem('theme');
    console.log("Saved theme:", savedTheme);
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        console.log("Dark theme applied");
    }
    
    const icon = document.body.classList.contains('dark-theme') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    
    if (themeToggle) {
        themeToggle.innerHTML = icon;
        console.log("Desktop theme icon set");
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.innerHTML = icon;
        console.log("Mobile theme icon set");
    }
}

console.log("Initializing mobile menu...");
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
console.log("Mobile menu button:", mobileMenuBtn ? "found" : "not found");

const mobileMenu = document.getElementById('mobileMenu');
console.log("Mobile menu:", mobileMenu ? "found" : "not found");

function toggleMobileMenu() {
    console.log("Toggling mobile menu...");
    if (!mobileMenuBtn || !mobileMenu) return;
    
    const isActive = !mobileMenu.classList.contains('active');
    console.log("New state:", isActive ? "active" : "inactive");
    
    mobileMenu.classList.toggle('active', isActive);
    mobileMenuBtn.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : 'auto';
}

function initSmoothScroll() {
    console.log("Initializing smooth scroll...");
    const anchors = document.querySelectorAll('a[href^="#"]');
    console.log("Anchor links found:", anchors.length);
    
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            console.log("Anchor clicked:", targetId);
            
            if (targetId === '#' || targetId === '#!') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                console.log("Target element found");
                
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    console.log("Closing mobile menu");
                    toggleMobileMenu();
                }
                
                console.log("Scrolling to element...");
                targetElement.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, targetId);
            } else {
                console.error("Target element not found:", targetId);
            }
        });
    });
}

let isScrolling = false;
function animateOnScroll() {
    if (isScrolling) return;
    
    isScrolling = true;
    console.log("Animating on scroll...");
    
    requestAnimationFrame(() => {
        const fadeElements = document.querySelectorAll('.fade-in:not(.appear)');
        console.log("Fade elements found:", fadeElements.length);
        
        const windowHeight = window.innerHeight;
        console.log("Window height:", windowHeight);
        
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            console.log(`Element top: ${elementTop}, visibility threshold: ${windowHeight - 100}`);
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('appear');
                console.log("Element appeared:", element);
            }
        });
        
        isScrolling = false;
    });
}

function initFAQ() {
    console.log("Initializing FAQ...");
    const faqItems = document.querySelectorAll('.faq-item');
    console.log("FAQ items found:", faqItems.length);
    
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            console.log("FAQ item clicked:", item);
            item.classList.toggle('active');
        });
    });
}

console.log("Adding DOMContentLoaded event listener...");
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event fired");
    
    console.log("Loading projects...");
    projects = await loadProjects();
    console.log("Projects loaded:", projects.length);
    
    generateProjectCards(projects);
    initTheme();
    initFilters();
    
    console.log("Getting current user...");
    const currentUser = await getCurrentUser();
    console.log("Current user:", currentUser);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        console.log("Theme toggle event added");
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
        console.log("Mobile theme toggle event added");
    }
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        console.log("Mobile menu button event added");
        
        const mobileLinks = document.querySelectorAll('.mobile-menu a');
        console.log("Mobile menu links found:", mobileLinks.length);
        
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                console.log("Mobile link clicked:", link.href);
                toggleMobileMenu();
            });
        });
    }

    const closeProjectModalBtn = document.getElementById('closeProjectModal');
    console.log("Close project modal button:", closeProjectModalBtn ? "found" : "not found");
    
    const closeDonationModalBtn = document.getElementById('closeDonationModal');
    console.log("Close donation modal button:", closeDonationModalBtn ? "found" : "not found");

    if (closeDonationModalBtn) {
        closeDonationModalBtn.addEventListener('click', closeDonationModal);
        console.log("Close donation modal event added");
    }
    
    if (closeProjectModalBtn) {
        closeProjectModalBtn.addEventListener('click', closeProjectModal);
        console.log("Close project modal event added");
    }

    window.addEventListener('click', (e) => {
        console.log("Window click event:", e.target);
        
        if (donationModal && e.target === donationModal) {
            console.log("Clicked outside donation modal");
            closeDonationModal();
        }
        
        if (projectModal && e.target === projectModal) {
            console.log("Clicked outside project modal");
            closeProjectModal();
        }
    });

    if (projectForm) {
        projectForm.addEventListener('input', checkFormValidity);
        console.log("Project form input event added");
        
        projectForm.addEventListener('submit', handleProjectSubmit);
        console.log("Project form submit event added");
        
        checkFormValidity();
    }

    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationSubmit);
        console.log("Donation form submit event added");
    } else {
        console.error("Donation form not found");
    }
    
    const addProjectBtn = document.getElementById('addProject');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', openProjectModal);
        console.log("Add project button event added");
    } else {
        console.error("Add project button not found");
    }
    
    initSmoothScroll();
    animateOnScroll();

    window.addEventListener('scroll', animateOnScroll, { passive: true });
    console.log("Scroll event added");
    
    if (window.location.hash) {
        console.log("Window hash:", window.location.hash);
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                console.log("Scrolling to hash target:", window.location.hash);
                target.scrollIntoView();
            } else {
                console.error("Hash target not found:", window.location.hash);
            }
        }, 100);
    }
    
    const progressBars = document.querySelectorAll('.progress-value');
    console.log("Progress bars found:", progressBars.length);
    
    if (progressBars.length > 0) {
        window.addEventListener('scroll', () => {
            console.log("Scroll event for progress bars");
            progressBars.forEach(bar => {
                const rect = bar.getBoundingClientRect();
                console.log("Progress bar rect:", rect);
                
                if (rect.top < window.innerHeight - 50) {
                    bar.style.transition = 'width 1.5s ease-in-out';
                    console.log("Progress bar transition applied");
                }
            });
        });
    }
});

console.log("Script initialization complete");
const API_BASE_URL = 'http://localhost:3001';
console.log("[Init] API_BASE_URL:", API_BASE_URL);

const universalWalletBtn = document.getElementById('universalWalletBtn');
const mobileUniversalWalletBtn = document.getElementById('mobileUniversalWalletBtn');
const walletText = document.getElementById('walletText');

console.log("[Wallet] Elements:", {
    universalWalletBtn,
    mobileUniversalWalletBtn,
    walletText
});

// Обновление UI кошелька
function updateWalletUI(address) {
    console.log("[Wallet] updateWalletUI called with address:", address);
    
    if (address) {
        const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        console.log("[Wallet] Formatted short address:", shortAddress);
        
        if (walletText) {
            walletText.textContent = shortAddress;
            console.log("[Wallet] Updated walletText");
        }
        
        if (mobileUniversalWalletBtn) {
            mobileUniversalWalletBtn.innerHTML = `<i class="fas fa-wallet"></i> ${shortAddress}`;
            console.log("[Wallet] Updated mobileUniversalWalletBtn");
        }
        
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', address);
        console.log("[Wallet] Saved wallet state to localStorage");
        
        if (universalWalletBtn) {
            universalWalletBtn.href = "profile.html";
            console.log("[Wallet] Set profile link for universalWalletBtn");
        }
    } else {
        console.log("[Wallet] Resetting wallet UI");
        
        if (walletText) walletText.textContent = 'Подключить кошелек';
        if (mobileUniversalWalletBtn) {
            mobileUniversalWalletBtn.innerHTML = '<i class="fas fa-wallet"></i> Подключить кошелек';
        }
        
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        console.log("[Wallet] Removed wallet state from localStorage");
        
        if (universalWalletBtn) {
            universalWalletBtn.removeAttribute('href');
            console.log("[Wallet] Removed href from universalWalletBtn");
        }
    }
}

// Обработчики для универсальных кнопок
if (universalWalletBtn) {
    console.log("[Wallet] Adding event listener for universalWalletBtn");
    universalWalletBtn.addEventListener('click', async function(e) {
        console.log("[Wallet] universalWalletBtn clicked");
        
        if (!localStorage.getItem('walletConnected')) {
            console.log("[Wallet] Wallet not connected - preventing default");
            e.preventDefault();
            await connectWallet();
        } else {
            console.log("[Wallet] Wallet already connected - proceeding to profile");
        }
    });
}

if (mobileUniversalWalletBtn) {
    console.log("[Wallet] Adding event listener for mobileUniversalWalletBtn");
    mobileUniversalWalletBtn.addEventListener('click', async function(e) {
        console.log("[Wallet] mobileUniversalWalletBtn clicked");
        
        if (!localStorage.getItem('walletConnected')) {
            console.log("[Wallet] Wallet not connected - preventing default");
            e.preventDefault();
            await connectWallet();
        } else {
            console.log("[Wallet] Wallet already connected - going to profile");
            window.location.href = "profile.html";
        }
    });
}

// Функция подключения кошелька
async function connectWallet() {
    console.log("[Wallet] connectWallet called");
    
    if (window.ethereum) {
        console.log("[Wallet] Ethereum provider detected");
        
        try {
            console.log("[Wallet] Requesting accounts...");
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            console.log("[Wallet] Received accounts:", accounts);
            
            if (accounts.length > 0) {
                console.log("[Wallet] Accounts available - updating UI");
                updateWalletUI(accounts[0]);
            } else {
                console.log("[Wallet] No accounts received");
            }
        } catch (error) {
            console.error("[Wallet] Connection error:", error);
            alert("Ошибка подключения кошелька: " + error.message);
        }
    } else {
        console.log("[Wallet] No Ethereum provider detected");
        alert("Пожалуйста, установите MetaMask!");
    }
}

// Обработчик изменения аккаунтов
if (window.ethereum) {
    console.log("[Wallet] Adding accountsChanged event listener");
    window.ethereum.on('accountsChanged', (accounts) => {
        console.log("[Wallet] accountsChanged event:", accounts);
        
        if (accounts.length === 0) {
            console.log("[Wallet] No accounts - resetting UI");
            updateWalletUI(null);
        } else {
            console.log("[Wallet] Accounts changed - updating UI");
            updateWalletUI(accounts[0]);
        }
    });
}

// API функции
async function apiRequest(endpoint, method = 'GET', body = null) {
    console.log(`[API] Request: ${method} ${endpoint}`);
    const url = `${API_BASE_URL}${endpoint}`;
    console.log("[API] Full URL:", url);
    
    const options = {
        method,
        headers: {},
        credentials: 'include'
    };

    if (method !== 'GET') {
        options.headers['Content-Type'] = 'application/json';
    }
    
    if (body) {
        console.log("[API] Request body:", body);
        options.body = JSON.stringify(body);
    }
    
    console.log("[API] Request options:", options);
    
    try {
        console.log("[API] Sending request...");
        const response = await fetch(url, options);
        console.log("[API] Response received. Status:", response.status);
        
        if (!response.ok) {
            console.log("[API] Response not OK. Trying to parse error...");
            const errorData = await response.json();
            console.error("[API] Error data:", errorData);
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        console.log("[API] Parsing response JSON...");
        const data = await response.json();
        console.log("[API] Response data:", data);
        return data;
    } catch (error) {
        console.error(`[API] Request to ${endpoint} failed:`, error);
        throw error;
    }
}

async function loadProjects() {
    console.log("[Projects] Loading projects...");
    try {
        const data = await apiRequest('/funds/');
        console.log("[Projects] Projects loaded:", data.length);
        return data;
    } catch (error) {
        console.error('[Projects] Error loading projects:', error);
        return [];
    }
}

async function createFund(fundData) {
    console.log("[Fund] Creating fund:", fundData);
    try {
        const response = await apiRequest('/funds/', 'POST', fundData);
        console.log("[Fund] Created. Response:", response);
        return response;
    } catch (error) {
        console.error('[Fund] Create error:', error);
        throw error;
    }
}

async function getCurrentUser() {
    console.log("[Auth] Getting current user...");
    try {
        const user = await apiRequest('/auth/me');
        console.log("[Auth] Current user:", user);
        return user;
    } catch (error) {
        console.error('[Auth] Get user error:', error);
        return null;
    }
}

// Категории проектов
const categories = { 
    1: "Дети",
    2: "Здоровье",
    3: "Животные",
    4: "Образование",
    5: "Экология",
    6: "Социальная помощь" 
};
console.log("[Categories] Mapping:", categories);

const eng_categories = { 
    all: 0,
    children: 1,
    health: 2,
    animals: 3,
    education: 4,
    ecology: 5,
    social: 6 
};
console.log("[Categories] English mapping:", eng_categories);

let projects = [];
console.log("[Projects] Array initialized:", projects);

let currentFilter = {
    search: "",
    category_id: 0
};
console.log("[Filter] Initial state:", currentFilter);

// Генерация карточек проектов
function generateProjectCards(filteredProjects) {
    console.log("[Projects] Generating cards. Count:", filteredProjects.length);
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (!projectsGrid) {
        console.error("[Projects] projectsGrid element not found!");
        return;
    }
    
    projectsGrid.innerHTML = '';
    
    if (filteredProjects.length === 0) {
        console.log("[Projects] No projects found. Showing message");
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
        console.log("[Projects] Rendering project:", project.id, project.title);
        const progress = Math.min(Math.round((project.collected / project.target) * 100), 100);
        console.log(`[Projects] Progress for ${project.title}: ${progress}%`);
        
        const categoryName = categories[project.category_id] || `Unknown (${project.category_id})`;
        console.log("[Projects] Category name:", categoryName);
        
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
        console.log("[Projects] Count updated:", filteredProjects.length);
    } else {
        console.error("[Projects] projectsCount element not found!");
    }
}

// Фильтрация проектов
function filterProjects() {
    console.log("[Filter] Filtering projects. Search:", currentFilter.search, "Category:", currentFilter.category_id);
    const filtered = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(currentFilter.search.toLowerCase());
        const matchesCategory = currentFilter.category_id === 0 || project.category_id === currentFilter.category_id;
        
        console.log(`[Filter] Project ${project.id}: search=${matchesSearch}, category=${matchesCategory}`);
        return matchesSearch && matchesCategory;
    });
    
    console.log("[Filter] Filtered count:", filtered.length);
    return filtered;
}

function applyFilters() {
    console.log("[Filter] Applying filters...");
    const filteredProjects = filterProjects();
    generateProjectCards(filteredProjects);
}

function initFilters() {
    console.log("[Filter] Initializing...");
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
        console.error("[Filter] searchInput element not found!");
        return;
    }
    
    searchInput.addEventListener('input', (e) => {
        console.log("[Filter] Search input changed:", e.target.value);
        currentFilter.search = e.target.value;
        applyFilters();
    });
    
    const categoryButtons = document.querySelectorAll('.category-btn');
    console.log("[Filter] Category buttons found:", categoryButtons.length);
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            console.log("[Filter] Category button clicked:", category);
            
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentFilter.category_id = eng_categories[category];
            console.log("[Filter] Current category set to:", currentFilter.category_id);
            
            applyFilters();
        });
    });
    
    const allButton = document.querySelector('.category-btn[data-category="all"]');
    if (allButton) {
        allButton.classList.add('active');
        console.log("[Filter] 'All' category activated");
    } else {
        console.error("[Filter] 'All' category button not found!");
    }
}

// Функция для просмотра деталей проекта
window.viewProjectDetails = function(projectId) {
    console.log("[Navigation] Viewing project details:", projectId);
    window.location.href = `project-details.html?id=${projectId}`;
};

console.log("[Theme] Initializing...");
const themeToggle = document.getElementById('themeToggle');
console.log("[Theme] Toggle:", themeToggle ? "found" : "not found");

const mobileThemeToggle = document.getElementById('mobileThemeToggle');
console.log("[Theme] Mobile toggle:", mobileThemeToggle ? "found" : "not found");

function toggleTheme() {
    console.log("[Theme] Toggling...");
    document.body.classList.toggle('dark-theme');
    
    const isDark = document.body.classList.contains('dark-theme');
    console.log("[Theme] Dark theme:", isDark);
    
    const icon = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    if (themeToggle) {
        themeToggle.innerHTML = icon;
        console.log("[Theme] Desktop icon updated");
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.innerHTML = icon;
        console.log("[Theme] Mobile icon updated");
    }
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    console.log("[Theme] Saved to localStorage");
}

function initTheme() {
    console.log("[Theme] Initializing...");
    const savedTheme = localStorage.getItem('theme');
    console.log("[Theme] Saved theme:", savedTheme);
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        console.log("[Theme] Dark theme applied");
    }
    
    const icon = document.body.classList.contains('dark-theme') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    
    if (themeToggle) {
        themeToggle.innerHTML = icon;
        console.log("[Theme] Desktop icon set");
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.innerHTML = icon;
        console.log("[Theme] Mobile icon set");
    }
}

// Мобильное меню
console.log("[MobileMenu] Initializing...");
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
console.log("[MobileMenu] Button:", mobileMenuBtn ? "found" : "not found");

const mobileMenu = document.getElementById('mobileMenu');
console.log("[MobileMenu] Menu:", mobileMenu ? "found" : "not found");

function toggleMobileMenu() {
    console.log("[MobileMenu] Toggling...");
    if (!mobileMenuBtn || !mobileMenu) return;
    
    const isActive = !mobileMenu.classList.contains('active');
    console.log("[MobileMenu] New state:", isActive ? "active" : "inactive");
    
    mobileMenu.classList.toggle('active', isActive);
    mobileMenuBtn.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : 'auto';
}

// Плавная прокрутка
function initSmoothScroll() {
    console.log("[Scroll] Initializing smooth scroll...");
    const anchors = document.querySelectorAll('a[href^="#"]');
    console.log("[Scroll] Anchor links found:", anchors.length);
    
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            console.log("[Scroll] Anchor clicked:", targetId);
            
            if (targetId === '#' || targetId === '#!') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                console.log("[Scroll] Target element found");
                
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    console.log("[Scroll] Closing mobile menu");
                    toggleMobileMenu();
                }
                
                console.log("[Scroll] Scrolling...");
                targetElement.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, targetId);
            } else {
                console.error("[Scroll] Target element not found:", targetId);
            }
        });
    });
}

// Анимация при прокрутке
let isScrolling = false;
function animateOnScroll() {
    if (isScrolling) return;
    
    isScrolling = true;
    console.log("[Animation] Animating on scroll...");
    
    requestAnimationFrame(() => {
        const fadeElements = document.querySelectorAll('.fade-in:not(.appear)');
        console.log("[Animation] Fade elements found:", fadeElements.length);
        
        const windowHeight = window.innerHeight;
        console.log("[Animation] Window height:", windowHeight);
        
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            console.log(`[Animation] Element top: ${elementTop}, threshold: ${windowHeight - 100}`);
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('appear');
                console.log("[Animation] Element appeared:", element);
            }
        });
        
        isScrolling = false;
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Init] DOMContentLoaded event fired");
    
    // Инициализация кошелька
    const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
    const walletAddress = localStorage.getItem('walletAddress');
    console.log("[Wallet] Initial state:", {isWalletConnected, walletAddress});
    
    if (isWalletConnected && walletAddress) {
        console.log("[Wallet] Wallet connected - updating UI");
        updateWalletUI(walletAddress);
    }
    
    // Загрузка проектов
    console.log("[Projects] Loading...");
    projects = await loadProjects();
    console.log("[Projects] Loaded count:", projects.length);
    
    generateProjectCards(projects);
    initTheme();
    initFilters();
    
    // Получение текущего пользователя
    console.log("[Auth] Getting current user...");
    const currentUser = await getCurrentUser();
    console.log("[Auth] Current user:", currentUser);
    
    // Настройка темы
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        console.log("[Theme] Desktop toggle event added");
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
        console.log("[Theme] Mobile toggle event added");
    }
    
    // Мобильное меню
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        console.log("[MobileMenu] Button event added");
        
        const mobileLinks = document.querySelectorAll('.mobile-menu a');
        console.log("[MobileMenu] Links found:", mobileLinks.length);
        
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                console.log("[MobileMenu] Link clicked:", link.href);
                toggleMobileMenu();
            });
        });
    }

    // Кнопки закрытия модальных окон
    const closeProjectModalBtn = document.getElementById('closeProjectModal');
    console.log("[ProjectModal] Close button:", closeProjectModalBtn ? "found" : "not found");
    
    const closeDonationModalBtn = document.getElementById('closeDonationModal');
    console.log("[Donation] Close button:", closeDonationModalBtn ? "found" : "not found");

    if (closeDonationModalBtn) {
        closeDonationModalBtn.addEventListener('click', closeDonationModal);
        console.log("[Donation] Close event added");
    }
    
    if (closeProjectModalBtn) {
        closeProjectModalBtn.addEventListener('click', closeProjectModal);
        console.log("[ProjectModal] Close event added");
    }

    // Клики вне модальных окон
    window.addEventListener('click', (e) => {
        console.log("[Window] Click event:", e.target);
        
        if (donationModal && e.target === donationModal) {
            console.log("[Donation] Clicked outside modal");
            closeDonationModal();
        }
        
        if (projectModal && e.target === projectModal) {
            console.log("[ProjectModal] Clicked outside modal");
            closeProjectModal();
        }
    });
    
    // Инициализация других компонентов
    initSmoothScroll();
    animateOnScroll();

    window.addEventListener('scroll', animateOnScroll, { passive: true });
    console.log("[Animation] Scroll event added");
    
    // Обработка хеша в URL
    if (window.location.hash) {
        console.log("[Navigation] Window hash:", window.location.hash);
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                console.log("[Navigation] Scrolling to target:", window.location.hash);
                target.scrollIntoView();
            } else {
                console.error("[Navigation] Target not found:", window.location.hash);
            }
        }, 100);
    }
    
    // Анимация прогресс-баров
    const progressBars = document.querySelectorAll('.progress-value');
    console.log("[Animation] Progress bars found:", progressBars.length);
    
    if (progressBars.length > 0) {
        window.addEventListener('scroll', () => {
            console.log("[Animation] Scroll event for progress bars");
            progressBars.forEach(bar => {
                const rect = bar.getBoundingClientRect();
                console.log("[Animation] Bar rect:", rect);
                
                if (rect.top < window.innerHeight - 50) {
                    bar.style.transition = 'width 1.5s ease-in-out';
                    console.log("[Animation] Transition applied");
                }
            });
        });
    }
});

console.log("[Init] Script initialization complete");
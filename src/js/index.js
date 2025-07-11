// Объявляем элементы для универсальной кнопки кошелька
const universalWalletBtn = document.getElementById('universalWalletBtn');
const mobileUniversalWalletBtn = document.getElementById('mobileUniversalWalletBtn');
const walletText = document.getElementById('walletText');

console.log("[Wallet] Initializing wallet elements:", {
    universalWalletBtn,
    mobileUniversalWalletBtn,
    walletText
});

// Функция обновления интерфейса кошелька
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

// Тема оформления
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');

console.log("[Theme] Theme elements:", {themeToggle, mobileThemeToggle});

function toggleTheme() {
    console.log("[Theme] toggleTheme called");
    
    const isDark = !document.body.classList.contains('dark-theme');
    document.body.classList.toggle('dark-theme');
    console.log(`[Theme] New theme: ${isDark ? 'dark' : 'light'}`);

    const icon = isDark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';

    if (themeToggle) {
        themeToggle.innerHTML = icon;
        console.log("[Theme] Updated desktop theme icon");
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.innerHTML = icon;
        console.log("[Theme] Updated mobile theme icon");
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    console.log("[Theme] Saved theme to localStorage");
}

function setupThemeToggle() {
    console.log("[Theme] Setting up theme toggles");
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }
}

function initTheme() {
    console.log("[Theme] Initializing theme");
    
    const savedTheme = localStorage.getItem('theme');
    console.log("[Theme] Saved theme from localStorage:", savedTheme);
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = '<i class="fas fa-sun"></i>';
        
        if (themeToggle) themeToggle.innerHTML = icon;
        if (mobileThemeToggle) mobileThemeToggle.innerHTML = icon;
        
        console.log("[Theme] Applied dark theme");
    } else {
        const icon = '<i class="fas fa-moon"></i>';
        
        if (themeToggle) themeToggle.innerHTML = icon;
        if (mobileThemeToggle) mobileThemeToggle.innerHTML = icon;
        
        console.log("[Theme] Applied light theme");
    }
}

// Мобильное меню
function toggleMobileMenu() {
    console.log("[Mobile] toggleMobileMenu called");
    
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    if (!mobileMenu || !mobileMenuBtn) {
        console.error("[Mobile] Elements not found");
        return;
    }

    const isActive = !mobileMenu.classList.contains('active');
    mobileMenu.classList.toggle('active', isActive);
    mobileMenuBtn.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : 'auto';
    
    console.log(`[Mobile] Menu ${isActive ? 'opened' : 'closed'}`);
}

function setupMobileMenuLinks() {
    console.log("[Mobile] Setting up mobile menu links");
    
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            console.log("[Mobile] Mobile link clicked");
            toggleMobileMenu();
        });
    });
}

// Модальное окно проекта
const projectModal = document.getElementById('projectModal');
console.log("[ProjectModal] Element:", projectModal);

function openProjectModal() {
    console.log("[ProjectModal] openProjectModal called");
    
    if (projectModal) {
        projectModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log("[ProjectModal] Modal opened");
    }
}

function closeProjectModal() {
    console.log("[ProjectModal] closeProjectModal called");
    
    if (projectModal) {
        projectModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log("[ProjectModal] Modal closed");
    }
}

function checkFormValidity() {
    console.log("[Form] Checking form validity");
    
    const projectForm = document.getElementById('projectForm');
    const submitProjectBtn = document.getElementById('submitProjectBtn');

    if (!projectForm || !submitProjectBtn) {
        console.error("[Form] Elements not found");
        return;
    }

    const requiredFields = projectForm.querySelectorAll('[required]');
    const allValid = Array.from(requiredFields).every(
        field => field.value.trim() !== ''
    );
    
    submitProjectBtn.disabled = !allValid;
    console.log(`[Form] Form validity: ${allValid ? 'valid' : 'invalid'}`);
}

function handleProjectSubmit(e) {
    console.log("[Form] handleProjectSubmit called");
    e.preventDefault();

    try {
        console.log("[Form] Project submitted successfully");
        alert('Заявка успешно отправлена!');
        e.target.reset();
        closeProjectModal();
    } catch (error) {
        console.error('[Form] Submission error:', error);
        alert('Произошла ошибка при отправке');
    }
}

// Плавная прокрутка
function initSmoothScroll() {
    console.log("[Scroll] Initializing smooth scroll");
    
    const mobileMenu = document.getElementById('mobileMenu');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            console.log("[Scroll] Anchor clicked:", targetId);
            
            if (targetId === '#' || targetId === '#!') return;

            e.preventDefault();
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    console.log("[Scroll] Closing mobile menu before scroll");
                    toggleMobileMenu();
                }

                console.log("[Scroll] Scrolling to element:", targetId);
                targetElement.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, targetId);
            }
        });
    });
}

// Анимация при прокрутке
let isScrolling = false;
function animateOnScroll() {
    if (isScrolling) return;

    isScrolling = true;
    requestAnimationFrame(() => {
        const fadeElements = document.querySelectorAll('.fade-in:not(.appear)');
        console.log(`[Animation] Found ${fadeElements.length} elements to animate`);
        
        const windowHeight = window.innerHeight;

        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - 100) {
                element.classList.add('appear');
                console.log("[Animation] Element appeared:", element);
            }
        });

        isScrolling = false;
    });
}

// FAQ секция
function initFAQ() {
    console.log("[FAQ] Initializing FAQ section");
    
    const faqItems = document.querySelectorAll('.faq-item');
    console.log(`[FAQ] Found ${faqItems.length} FAQ items`);
    
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            console.log("[FAQ] FAQ item clicked");
            item.classList.toggle('active');
        });
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Init] DOMContentLoaded");
    
    // Инициализация кошелька
    const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
    const walletAddress = localStorage.getItem('walletAddress');
    console.log("[Wallet] Initial state:", {isWalletConnected, walletAddress});
    
    if (isWalletConnected && walletAddress) {
        console.log("[Wallet] Wallet connected - updating UI");
        updateWalletUI(walletAddress);
    }
    
    // Инициализация темы
    initTheme();
    setupThemeToggle();

    // Инициализация мобильного меню
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        console.log("[Mobile] Adding event listener for mobileMenuBtn");
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    setupMobileMenuLinks();

    // Инициализация модального окна проекта
    const addProjectBtn = document.getElementById('addProject');
    const closeProjectModalBtn = document.getElementById('closeProjectModal');
    const projectForm = document.getElementById('projectForm');

    console.log("[ProjectModal] Elements:", {
        addProjectBtn,
        closeProjectModalBtn,
        projectForm
    });

    if (addProjectBtn) {
        console.log("[ProjectModal] Adding event listener for addProjectBtn");
        addProjectBtn.addEventListener('click', openProjectModal);
    }
    
    if (closeProjectModalBtn) {
        console.log("[ProjectModal] Adding event listener for closeProjectModalBtn");
        closeProjectModalBtn.addEventListener('click', closeProjectModal);
    }

    window.addEventListener('click', e => {
        if (e.target === projectModal) {
            console.log("[ProjectModal] Clicked outside modal - closing");
            closeProjectModal();
        }
    });

    if (projectForm) {
        console.log("[Form] Adding form event listeners");
        projectForm.addEventListener('input', checkFormValidity);
        projectForm.addEventListener('submit', handleProjectSubmit);
        checkFormValidity();
    }

    // Инициализация других компонентов
    initSmoothScroll();
    initFAQ();
    animateOnScroll();

    window.addEventListener('scroll', animateOnScroll, { passive: true });

    // Обработка хеша в URL
    if (window.location.hash) {
        console.log("[Scroll] Found hash in URL:", window.location.hash);
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                console.log("[Scroll] Scrolling to target:", window.location.hash);
                target.scrollIntoView();
            }
        }, 100);
    }
    
    console.log("[Init] Initialization complete");
});
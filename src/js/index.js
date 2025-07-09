const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    themeToggle.innerHTML = document.body.classList.contains('dark-theme') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
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
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function toggleMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
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
        document.body.style.overflow = 'disabled';
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

function handleProjectSubmit(e) {
    e.preventDefault();
    
    try {
        alert('Заявка успешно отправлена!');
        e.target.reset();
        closeProjectModal();
    } catch (error) {
        console.error('Ошибка отправки:', error);
        alert('Произошла ошибка при отправке');
    }
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
    initTheme();
    
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);
    
    const addProjectBtn = document.getElementById('addProject');
    const closeProjectModalBtn = document.getElementById('closeProjectModal');
    const projectForm = document.getElementById('projectForm');
    
    if (addProjectBtn) addProjectBtn.addEventListener('click', openProjectModal);
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
    initFAQ();
    animateOnScroll(); 
    
    window.addEventListener('scroll', animateOnScroll, { passive: true });
    
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) target.scrollIntoView();
        }, 100);
    }
});
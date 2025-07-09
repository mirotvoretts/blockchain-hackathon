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

    if (document.getElementById('profileSection')) {
        initProfilePage();
    }
});
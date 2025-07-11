console.log("[1] Script profile.js started loading");

const API_BASE_URL = 'http://localhost:3001';
console.log("[2] API_BASE_URL set to:", API_BASE_URL);

const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');
console.log("[3] Theme toggles initialized:", { themeToggle, mobileThemeToggle });

// Функция для работы с API
async function apiRequest(endpoint, method = 'GET', body = null) {
    console.log(`[4] Making API request to ${endpoint}`, { method, body });
    
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
        console.log("[5] Sending fetch request");
        const response = await fetch(url, options);
        console.log("[6] Received response, status:", response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error("[7] API error:", errorData);
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("[8] API response data:", data);
        return data;
    } catch (error) {
        console.error(`[9] API request to ${endpoint} failed:`, error);
        throw error;
    }
}

async function getCurrentUser() {
    console.log("[10] getCurrentUser called");
    try {
        const user = await apiRequest('/auth/me');
        console.log("[11] Current user data:", user);
        return user;
    } catch (error) {
        console.error('[12] Get user error:', error);
        return null;
    }
}

async function loadUserProjects() {
    console.log("[13] loadUserProjects called");
    try {
        const projects = await apiRequest('/funds/my');
        console.log("[14] Loaded user projects:", projects);
        return projects;
    } catch (error) {
        console.error('[15] Error loading user projects:', error);
        return [];
    }
}

async function displayUserProjects() {
    console.log("[16] displayUserProjects called");
    const container = document.querySelector('#myProjectsSection .my-projects');
    console.log("[17] Projects container:", container);
    
    if (!container) return;
    
    container.innerHTML = '<p class="loading">Загрузка ваших проектов...</p>';
    console.log("[18] Added loading message");
    
    try {
        console.log("[19] Creating test project");
        let projects = [{
            id: 4,
            title: "Тестовый проект",
            description: "Это тестовый проект для отладки. Он показывает, как будет выглядеть карточка проекта в вашем профиле.",
            collected: 5.3,
            target: 15,
            status: 'active',
            donate_count: 7,
            days_left: 28
        }];
        
        console.log("[20] Test project created:", projects);
        
        if (projects.length === 0) {
            console.log("[21] No projects found");
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
        console.log("[22] Container cleared");
        
        projects.forEach(project => {
            console.log("[23] Processing project:", project);
            const progress = Math.min(Math.round((project.collected / project.target) * 100), 100);
            console.log("[24] Progress calculated:", progress);
            
            const status = project.status === 'active' ? 'Активный' : project.status === 'completed' ? 'Завершен' : 'На модерации';
            console.log("[25] Status determined:", status);
            
            const projectCard = document.createElement('div');
            projectCard.className = 'user-project-card';
            console.log("[26] Project card created");
            
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
                    <button class="btn btn-editor" onclick="editProject(${project.id})">
                        <i class="fas fa-pen"></i> Редактирование
                    </button>
                </div>
            `;
            
            console.log("[27] Project card HTML set");
            container.appendChild(projectCard);
            console.log("[28] Project card added to container");
        });
    } catch (error) {
        console.error('[29] Error displaying projects:', error);
        container.innerHTML = '<p class="error">Ошибка загрузки проектов. Попробуйте позже.</p>';
    }
}

window.viewProject = function(projectId) {
    console.log("[30.1] viewProject called with id:", projectId);
    window.location.href = `project-details.html?id=${projectId}`;
};

window.editProject = function(projectId) {
    console.log("[30.2] editProject called with id:", projectId);
    window.location.href = `project-editor.html?id=${projectId}`;
};

function initProjectsSection() {
    console.log("[31] initProjectsSection called");
    const addProjectBtn = document.getElementById('addProject');
    console.log("[32] addProject button:", addProjectBtn);
    
    addProjectBtn.id = 'addProjectBtn';
    addProjectBtn.className = 'btn-add-project';
    addProjectBtn.innerHTML = '<i class="fas fa-plus"></i> Добавить проект';
    console.log("[33] addProjectBtn configured");
    
    addProjectBtn.addEventListener('click', openProjectModal);
    console.log("[34] Added click event to addProjectBtn");
    
    const projectsSection = document.getElementById('myProjectsSection');
    console.log("[35] projectsSection:", projectsSection);
    
    if (projectsSection) {
        projectsSection.querySelector('.my-projects').before(addProjectBtn);
        console.log("[36] addProjectBtn positioned");
    }
    
    const projectsLink = document.querySelector('.profile-menu a[data-section="myProjects"]');
    console.log("[37] projectsLink:", projectsLink);
    
    if (projectsLink) {
        projectsLink.addEventListener('click', displayUserProjects);
        console.log("[38] Added click event to projectsLink");
    }
}

async function handleProjectSubmit(e) {
    console.log("[39] handleProjectSubmit called");
    e.preventDefault();
    
    const projectData = {
        title: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        contact_name: document.getElementById('contactName').value,
        contact_email: document.getElementById('projectEmail').value,
        contact_phone: document.getElementById('projectPhone').value,
        website: document.getElementById('projectLink').value || null,
        category_id: 1,
        target: 10
    };
    
    console.log("[40] Project data prepared:", projectData);
    
    const submitBtn = document.getElementById('submitProjectBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    console.log("[41] Submit button disabled and spinner shown");
    
    try {
        console.log("[42] Sending project data to API");
        await apiRequest('/funds/', 'POST', projectData);
        console.log("[43] Project created successfully");
        
        alert('Проект успешно создан и отправлен на модерацию!');
        projectForm.reset();
        closeProjectModal();
        displayUserProjects();
    } catch (error) {
        console.error('[44] Create project error:', error);
        alert(`Ошибка создания проекта: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Отправить заявку';
        console.log("[45] Submit button re-enabled");
    }
}

function toggleTheme() {
    console.log("[46] toggleTheme called");
    document.body.classList.toggle('dark-theme');
    
    const isDark = document.body.classList.contains('dark-theme');
    console.log("[47] New theme state:", isDark ? 'dark' : 'light');
    
    const icon = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    if (themeToggle) themeToggle.innerHTML = icon;
    if (mobileThemeToggle) mobileThemeToggle.innerHTML = icon;
    console.log("[48] Theme icons updated");
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    console.log("[49] Theme saved to localStorage");
}

function initTheme() {
    console.log("[50] initTheme called");
    const savedTheme = localStorage.getItem('theme');
    console.log("[51] Saved theme from localStorage:", savedTheme);
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = '<i class="fas fa-sun"></i>';
        if (themeToggle) themeToggle.innerHTML = icon;
        if (mobileThemeToggle) mobileThemeToggle.innerHTML = icon;
        console.log("[52] Dark theme applied");
    }
}

function toggleMobileMenu() {
    console.log("[53] toggleMobileMenu called");
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    console.log("[54] Mobile elements:", { mobileMenu, mobileMenuBtn });
    
    if (!mobileMenu || !mobileMenuBtn) return;
    
    const isActive = !mobileMenu.classList.contains('active');
    console.log("[55] New mobile menu state:", isActive ? 'active' : 'inactive');
    
    mobileMenu.classList.toggle('active', isActive);
    mobileMenuBtn.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : 'auto';
    console.log("[56] Mobile menu toggled");
}

function setupMobileMenuLinks() {
    console.log("[57] setupMobileMenuLinks called");
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    console.log("[58] Found mobile links:", mobileLinks.length);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            console.log("[59] Mobile link clicked:", link.textContent);
            toggleMobileMenu();
        });
    });
}
    
const projectModal = document.getElementById('projectModal');
console.log("[60] projectModal:", projectModal);

function openProjectModal() {
    console.log("[61] openProjectModal called");
    if (projectModal) {
        projectModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log("[62] Project modal opened");
    }
}

function closeProjectModal() {
    console.log("[63] closeProjectModal called");
    if (projectModal) {
        projectModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log("[64] Project modal closed");
    }
}

function checkFormValidity() {
    console.log("[65] checkFormValidity called");
    const projectForm = document.getElementById('projectForm');
    const submitProjectBtn = document.getElementById('submitProjectBtn');
    console.log("[66] Form elements:", { projectForm, submitProjectBtn });
    
    if (!projectForm || !submitProjectBtn) return;
    
    const requiredFields = projectForm.querySelectorAll('[required]');
    const isValid = Array.from(requiredFields).every(field => field.value.trim() !== '');
    console.log("[67] Form validity:", isValid);
    
    submitProjectBtn.disabled = !isValid;
}

function initSmoothScroll() {
    console.log("[68] initSmoothScroll called");
    const mobileMenu = document.getElementById('mobileMenu');
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            console.log("[69] Smooth scroll to:", targetId);
            
            if (targetId === '#' || targetId === '#!') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            console.log("[70] Target element:", targetElement);
            
            if (targetElement) {
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    console.log("[71] Closing mobile menu for scroll");
                    toggleMobileMenu();
                }
                
                targetElement.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, targetId);
                console.log("[72] Scrolled to target");
            }
        });
    });
}

let isScrolling = false;
function animateOnScroll() {
    if (isScrolling) return;
    
    isScrolling = true;
    console.log("[73] animateOnScroll triggered");
    
    requestAnimationFrame(() => {
        const fadeElements = document.querySelectorAll('.fade-in:not(.appear)');
        console.log("[74] Fade elements found:", fadeElements.length);
        
        const windowHeight = window.innerHeight;
        console.log("[75] Window height:", windowHeight);
        
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            console.log("[76] Element position:", { element, top: elementTop });
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('appear');
                console.log("[77] Element appeared:", element);
            }
        });
        
        isScrolling = false;
        console.log("[78] animateOnScroll completed");
    });
}

function setupProfileSections() {
    console.log("[79] setupProfileSections called");
    const menuLinks = document.querySelectorAll('.profile-menu a');
    const sections = document.querySelectorAll('.profile-section');
    console.log("[80] Found menu links:", menuLinks.length, "and sections:", sections.length);
    
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("[81] Profile menu link clicked:", link.textContent);
            
            menuLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
            console.log("[82] Menu links updated");
            
            sections.forEach(section => section.classList.remove('active'));
            console.log("[83] Sections deactivated");
            
            const sectionId = link.getAttribute('data-section') + 'Section';
            const activeSection = document.getElementById(sectionId);
            activeSection.classList.add('active');
            console.log("[84] Activated section:", sectionId);
        });
    });
}

function setupAvatarUpload() {
    console.log("[85] setupAvatarUpload called");
    const avatarUpload = document.getElementById('avatarUpload');
    const avatarInput = document.getElementById('avatarInput');
    const avatarImage = document.getElementById('avatarImage');
    console.log("[86] Avatar elements:", { avatarUpload, avatarInput, avatarImage });
    
    if (!avatarUpload || !avatarInput || !avatarImage) return;
    
    avatarUpload.addEventListener('click', () => {
        console.log("[87] Avatar upload clicked");
        avatarInput.click();
    });
    
    avatarInput.addEventListener('change', (e) => {
        console.log("[88] Avatar file selected");
        const file = e.target.files[0];
        if (file) {
            console.log("[89] File selected:", file.name);
            const reader = new FileReader();
            reader.onload = function(event) {
                avatarImage.src = event.target.result;
                localStorage.setItem('userAvatar', event.target.result);
                console.log("[90] Avatar image updated and saved");
            }
            reader.readAsDataURL(file);
        }
    });
    
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        avatarImage.src = savedAvatar;
        console.log("[91] Avatar loaded from localStorage");
    }
}

function setupSaveProfile() {
    console.log("[92] setupSaveProfile called");
    const saveBtn = document.getElementById('saveProfile');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    console.log("[93] Profile elements:", { saveBtn, nameInput, emailInput, phoneInput, profileName, profileEmail, profilePhone });
    
    if (!saveBtn || !nameInput || !emailInput || !phoneInput) return;
    
    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    console.log("[94] Saved profile from localStorage:", savedProfile);
    
    if (savedProfile.name) nameInput.value = savedProfile.name;
    if (savedProfile.email) emailInput.value = savedProfile.email;
    if (savedProfile.phone) phoneInput.value = savedProfile.phone;
    console.log("[95] Inputs populated from localStorage");
    
    if (profileName) profileName.textContent = savedProfile.name || 'Имя пользователя';
    if (profileEmail) profileEmail.textContent = savedProfile.email || 'email@example.com';
    if (profilePhone) profilePhone.textContent = savedProfile.phone || 'Телефон не указан';
    console.log("[96] Profile display updated");
    
    saveBtn.addEventListener('click', () => {
        console.log("[97] Save profile clicked");
        const profileData = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value
        };
        console.log("[98] New profile data:", profileData);
        
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        console.log("[99] Profile saved to localStorage");
        
        if (profileName) profileName.textContent = profileData.name;
        if (profileEmail) profileEmail.textContent = profileData.email;
        if (profilePhone) profilePhone.textContent = profileData.phone || 'Телефон не указан';
        console.log("[100] Profile display updated");
        
        alert('Изменения профиля сохранены!');
    });
}

function setupProfileEdit() {
    console.log("[101] setupProfileEdit called");
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfile');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const profileSection = document.getElementById('profileSection');
    const editSection = document.getElementById('editSection');
    console.log("[102] Edit elements:", { editBtn, saveBtn, cancelBtn, profileSection, editSection });
    
    if (!editBtn || !saveBtn || !cancelBtn) return;
    
    loadProfileData();
    console.log("[103] Profile data loaded");
    
    editBtn.addEventListener('click', () => {
        console.log("[104] Edit button clicked");
        profileSection.style.display = 'none';
        editSection.style.display = 'block';
        console.log("[105] Switched to edit mode");
        
        document.getElementById('nameEdit').value = document.getElementById('nameView').textContent;
        document.getElementById('emailEdit').value = document.getElementById('emailView').textContent;
        document.getElementById('phoneEdit').value = document.getElementById('phoneView').textContent;
        console.log("[106] Edit inputs populated");
    });
    
    cancelBtn.addEventListener('click', () => {
        console.log("[107] Cancel button clicked");
        editSection.style.display = 'none';
        profileSection.style.display = 'block';
        console.log("[108] Switched back to view mode");
    });
    
    saveBtn.addEventListener('click', () => {
        console.log("[109] Save button clicked");
        const name = document.getElementById('nameEdit').value;
        const email = document.getElementById('emailEdit').value;
        const phone = document.getElementById('phoneEdit').value;
        console.log("[110] New values:", { name, email, phone });
        
        document.getElementById('nameView').textContent = name;
        document.getElementById('emailView').textContent = email;
        document.getElementById('phoneView').textContent = phone;
        console.log("[111] View elements updated");
        
        document.getElementById('profileName').textContent = name;
        document.getElementById('profileEmail').textContent = email || 'Почта не указана';
        document.getElementById('profilePhone').textContent = phone || 'Телефон не указан';
        console.log("[112] Profile elements updated");
        
        const profileData = {
            name: name,
            email: email,
            phone: phone
        };
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        console.log("[113] Profile saved to localStorage");
        
        editSection.style.display = 'none';
        profileSection.style.display = 'block';
        console.log("[114] Switched back to view mode");
        
        alert('Изменения сохранены успешно!');
    });
}

function loadProfileData() {
    console.log("[115] loadProfileData called");
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    console.log("[116] Saved profile from localStorage:", savedProfile);
    
    if (savedProfile) {
        document.getElementById('nameView').textContent = savedProfile.name;
        document.getElementById('emailView').textContent = savedProfile.email || 'Почта не указана';
        document.getElementById('phoneView').textContent = savedProfile.phone || 'Телефон не указан';
        console.log("[117] View elements populated");
        
        document.getElementById('profileName').textContent = savedProfile.name;
        document.getElementById('profileEmail').textContent = savedProfile.email|| 'Почта не указана';
        document.getElementById('profilePhone').textContent = savedProfile.phone || 'Телефон не указан';
        console.log("[118] Profile elements populated");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("[119] DOMContentLoaded event fired");
    initTheme();
    
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);
    console.log("[120] Theme toggles event listeners added");

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        console.log("[121] Mobile menu button event listener added");
    }
    
    setupMobileMenuLinks();
    
    const projectModal = document.getElementById('projectModal');
    const closeProjectModalBtn = document.getElementById('closeProjectModal');
    const projectForm = document.getElementById('projectForm');
    console.log("[122] Project modal elements:", { projectModal, closeProjectModalBtn, projectForm });
    
    if (closeProjectModalBtn) {
        closeProjectModalBtn.addEventListener('click', closeProjectModal);
        console.log("[123] Close modal button event listener added");
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            console.log("[124] Click outside modal detected");
            closeProjectModal();
        }
    });
    
    if (projectForm) {
        projectForm.addEventListener('input', checkFormValidity);
        projectForm.addEventListener('submit', handleProjectSubmit);
        checkFormValidity(); 
        console.log("[125] Project form event listeners added");
    }
    
    initSmoothScroll();
    animateOnScroll(); 
    setupProfileSections();
    setupProfileEdit();
    setupAvatarUpload();
    setupSaveProfile();
    console.log("[126] All setup functions called");
    
    window.addEventListener('scroll', animateOnScroll, { passive: true });
    console.log("[127] Scroll event listener added");
    
    if (window.location.hash) {
        console.log("[128] Window location hash:", window.location.hash);
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            console.log("[129] Target element for hash:", target);
            if (target) target.scrollIntoView();
        }, 100);
    }

    initProjectsSection();
    console.log("[130] Projects section initialized");
    
    if (document.querySelector('.profile-menu a[data-section="myProjects"]').classList.contains('active')) {
        console.log("[131] My projects section is active");
        displayUserProjects();
    }
    
    console.log("[132] Script initialization complete");
});
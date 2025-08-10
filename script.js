// EmailJS Configuration - Replace with your actual values
const EMAILJS_CONFIG = {
    serviceId: 'service_l62avrt',        // Your actual Service ID
    templateId: 'template_wodrdhb',      // Your template ID 
    publicKey: '48UXqCoHHV2pt15nc'       // Your public key
};

// Global variables
let selectedCompany = '';
let selectedBranch = '';
let currentAdmin = null;

// Theme Management
let currentTheme = localStorage.getItem('theme') || 'light';

// Enhanced Scroll Management for Auto-Hide Header
let lastScrollTop = 0;
let scrollThreshold = 50;
let isScrolling = false;
let headerHeight = 0;
let scrollTimer = null;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // SINGLE EmailJS initialization - wait for library to load
    setTimeout(() => {
        try {
            if (typeof emailjs !== 'undefined') {
                emailjs.init(EMAILJS_CONFIG.publicKey);
                console.log('✅ EmailJS initialized successfully');
            } else {
                console.error('❌ EmailJS library not loaded - email features will not work');
            }
        } catch (error) {
            console.error('❌ EmailJS initialization failed:', error);
        }
    }, 300);

    // Initialize page
    initializePage();

    // Enhanced page load animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.8s ease';
        document.body.style.opacity = '1';
    }, 100);

    // Auto-refresh for status page
    if (window.location.pathname.includes('status.html')) {
        setInterval(updateQueueNumbers, 30000);
    }
});

function initializeScrollHandler() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    // Get header height for calculations
    headerHeight = header.offsetHeight;
    
    let ticking = false;
    
    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Only hide header when scrolling down and past threshold
        if (scrollTop > scrollThreshold) {
            if (scrollTop > lastScrollTop && !isScrolling) {
                // Scrolling down - hide header completely
                header.classList.add('header-hidden');
                header.classList.remove('header-visible');
            } else if (scrollTop < lastScrollTop && !isScrolling) {
                // Scrolling up - show header
                header.classList.remove('header-hidden');
                header.classList.add('header-visible');
            }
        } else {
            // At top of page - always show header
            header.classList.remove('header-hidden');
            header.classList.add('header-visible');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    // Throttled scroll event with passive listener for better performance
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Enhanced scroll start/end detection for smoother transitions
    window.addEventListener('scroll', function() {
        if (scrollTimer !== null) {
            clearTimeout(scrollTimer);
        }
        isScrolling = true;
        
        scrollTimer = setTimeout(function() {
            isScrolling = false;
            // Force update when scrolling stops
            requestTick();
        }, 150);
    }, { passive: true });
    
    // Initialize header state
    header.classList.add('header-visible');
    
    // Handle window resize
    window.addEventListener('resize', function() {
        headerHeight = header.offsetHeight;
    });
}

function initializeTheme() {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggle();
    
    // Setup theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggle();
    
    // Add smooth transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function updateThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const sunIcon = themeToggle.querySelector('.fa-sun');
        const moonIcon = themeToggle.querySelector('.fa-moon');
        
        if (currentTheme === 'dark') {
            themeToggle.title = 'Switch to light mode';
            if (sunIcon) sunIcon.style.display = 'inline-block';
            if (moonIcon) moonIcon.style.display = 'none';
        } else {
            themeToggle.title = 'Switch to dark mode';
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'inline-block';
        }
    }
}

// Enhanced Animation and UI Features
let isLoading = false;
let toastContainer = null;

// Initialize enhanced features
function initializeEnhancedFeatures() {
    initializeTheme();
    initializeScrollHandler();
    createToastContainer();
    initializeFormValidation();
    initializeMobileNav();
    initializeProgressIndicator();
    setupEnhancedAnimations();
    setupConfettiSystem();
}

// Toast Notification System
function createToastContainer() {
    if (toastContainer) return;
    
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
    `;
    document.body.appendChild(toastContainer);
}

function showToast(title, message, type = 'info', duration = 4000) {
    if (!toastContainer) {
        createToastContainer();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
    <div class="toast-icon" style="margin-right: 12px; font-size: 20px; color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#007bff'};">
        <i class="${icons[type] || icons.info}"></i>
    </div>
    <div class="toast-content" style="flex: 1;">
        <div class="toast-title" style="font-weight: 600; margin-bottom: 4px;">${title}</div>
        <div class="toast-message" style="font-size: 14px; opacity: 0.8;">${message}</div>
    </div>
    <button class="toast-close" onclick="closeToast(this)" style="background: none; border: none; font-size: 16px; color: inherit; cursor: pointer; padding: 4px; margin-left: 8px; opacity: 0.7;">
        <i class="fas fa-times"></i>
    </button>
`;
    
    // Add inline toast styles with proper contrast
    toast.style.cssText = `
    display: flex;
    align-items: center;
    background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
    color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    margin-bottom: 10px;
    padding: 16px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    border-left: 4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#007bff'};
    font-weight: 500;
`;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        closeToast(toast.querySelector('.toast-close'));
    }, duration);
}

function closeToast(closeBtn) {
    const toast = closeBtn.closest('.toast');
    if (toast) {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// Enhanced Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', validateField);
            input.addEventListener('blur', validateField);
        });
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing validation
    field.classList.remove('valid', 'invalid');
    const existingValidation = field.parentNode.querySelector('.form-validation');
    if (existingValidation) {
        existingValidation.remove();
    }
    
    let isValid = true;
    let message = '';
    
    // Validation rules
    switch (field.name) {
        case 'fullName':
            isValid = value.length >= 2 && /^[a-zA-Z\s\u0600-\u06FF]+$/.test(value);
            message = isValid ? 'Valid name' : 'Please enter a valid name (letters only)';
            break;
            
        case 'nationalId':
            isValid = /^\d{14}$/.test(value);
            message = isValid ? 'Valid National ID' : 'National ID must be exactly 14 digits';
            break;
            
        case 'phoneNumber':
            isValid = /^01[0-2,5]\d{8}$/.test(value);
            message = isValid ? 'Valid phone number' : 'Please enter a valid Egyptian phone number';
            break;
            
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            message = isValid ? 'Valid email' : 'Please enter a valid email address';
            break;
            
        default:
            if (field.required && !value) {
                isValid = false;
                message = 'This field is required';
            }
    }
    
    // Apply validation styling
    if (value) {
        field.classList.add(isValid ? 'valid' : 'invalid');
        
        // Add validation message
        const validationDiv = document.createElement('div');
        validationDiv.className = `form-validation ${isValid ? 'valid' : 'invalid'}`;
        validationDiv.innerHTML = `
            <i class="fas fa-${isValid ? 'check' : 'times'}"></i>
            <span>${message}</span>
        `;
        field.parentNode.appendChild(validationDiv);
    }
    
    return isValid;
}

// Mobile Navigation
function initializeMobileNav() {
    if (window.innerWidth <= 768) {
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';
        mobileNav.innerHTML = `
            <div class="mobile-nav-items">
                <div class="mobile-nav-item" onclick="goHome()">
                    <i class="fas fa-home"></i>
                    <span>Home</span>
                </div>
                <div class="mobile-nav-item" onclick="startBooking()">
                    <i class="fas fa-plus"></i>
                    <span>Book</span>
                </div>
                <div class="mobile-nav-item" onclick="refreshStatus()">
                    <i class="fas fa-sync-alt"></i>
                    <span>Refresh</span>
                </div>
                <div class="mobile-nav-item" onclick="window.location.href='status.html'">
                    <i class="fas fa-list"></i>
                    <span>Status</span>
                </div>
            </div>
        `;
        document.body.appendChild(mobileNav);
    }
}

// Progress Indicator
function initializeProgressIndicator() {
    const currentPage = window.location.pathname.split('/').pop();
    const steps = ['index.html', 'companies.html', 'branches.html', 'booking.html', 'status.html'];
    const stepNames = ['Home', 'Company', 'Branch', 'Booking', 'Status'];
    
    if (steps.includes(currentPage) && currentPage !== 'index.html') {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        
        const progressSteps = document.createElement('div');
        progressSteps.className = 'progress-steps';
        
        steps.forEach((step, index) => {
            if (step === 'index.html') return;
            
            const stepElement = document.createElement('div');
            stepElement.className = 'progress-step';
            
            const currentIndex = steps.indexOf(currentPage);
            const stepIndex = steps.indexOf(step);
            
            if (stepIndex < currentIndex) {
                stepElement.classList.add('completed');
            } else if (stepIndex === currentIndex) {
                stepElement.classList.add('active');
            }
            
            stepElement.innerHTML = `
                <div class="step-circle">
                    ${stepIndex < currentIndex ? '<i class="fas fa-check"></i>' : stepIndex - 1}
                </div>
                <div class="step-label">${stepNames[stepIndex]}</div>
            `;
            
            progressSteps.appendChild(stepElement);
        });
        
        progressContainer.appendChild(progressSteps);
        
        const pageContent = document.querySelector('.page-content');
        if (pageContent) {
            pageContent.insertBefore(progressContainer, pageContent.firstChild);
        }
    }
}

// Enhanced Animations
function setupEnhancedAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Stagger animation for grid items
                if (entry.target.classList.contains('company-card') || 
                    entry.target.classList.contains('branch-card')) {
                    const siblings = Array.from(entry.target.parentNode.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.company-card, .branch-card, .floating-card, .booking-form-card, .branch-info-card').forEach(el => {
        observer.observe(el);
    });
}

// Confetti System
function setupConfettiSystem() {
    window.showConfetti = function() {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti';
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(confettiContainer);
        
        // Create confetti pieces
        for (let i = 0; i < 50; i++) {
            const confettiPiece = document.createElement('div');
            confettiPiece.className = 'confetti-piece';
            confettiPiece.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][Math.floor(Math.random() * 5)]};
                left: ${Math.random() * 100}%;
                animation: confetti-fall ${Math.random() * 2 + 2}s linear forwards;
                animation-delay: ${Math.random() * 3}s;
            `;
            confettiContainer.appendChild(confettiPiece);
        }
        
        // Add CSS animation
        if (!document.getElementById('confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confetti-fall {
                    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            if (confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
        }, 5000);
    };
}

// Enhanced Loading States
function setLoadingState(element, isLoading) {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
        const originalText = element.innerHTML;
        element.dataset.originalText = originalText;
        element.innerHTML = '<div class="spinner"></div><span>Loading...</span>';
    } else {
        element.classList.remove('loading');
        element.disabled = false;
        element.innerHTML = element.dataset.originalText || element.innerHTML;
    }
}

// Sample data with Test Company added
const companies = loadCompaniesData();

// Function to load companies data from localStorage or use defaults
function loadCompaniesData() {
    const savedData = localStorage.getItem('companiesData');
    if (savedData) {
        return JSON.parse(savedData);
    }
    
    // Default data if nothing is saved
    return {
        electricity: {
            name: 'Electricity Services',
            nameAr: 'الكهرباء',
            fullName: 'Egyptian Electricity Holding Company',
            icon: 'fas fa-bolt',
            branches: [
                { id: 1, name: 'Cairo Main Branch', nameAr: 'فرع القاهرة الرئيسي', governorate: 'cairo', address: 'Downtown Cairo', currentNumber: 15, waiting: 8, estimatedTime: 80, workingHours: '8:00 AM - 4:00 PM' },
                { id: 2, name: 'Giza Branch', nameAr: 'فرع الجيزة', governorate: 'giza', address: 'Giza Center', currentNumber: 22, waiting: 5, estimatedTime: 50, workingHours: '8:00 AM - 4:00 PM' },
                { id: 3, name: 'Alexandria Branch', nameAr: 'فرع الإسكندرية', governorate: 'alexandria', address: 'Alexandria Downtown', currentNumber: 18, waiting: 12, estimatedTime: 120, workingHours: '8:00 AM - 4:00 PM' }
            ]
        },
        water: {
            name: 'Water & Wastewater',
            nameAr: 'المياه',
            fullName: 'Water & Wastewater Services',
            icon: 'fas fa-tint',
            branches: [
                { id: 4, name: 'Cairo Water Services', nameAr: 'خدمات مياه القاهرة', governorate: 'cairo', address: 'Nasr City', currentNumber: 12, waiting: 6, estimatedTime: 60, workingHours: '8:00 AM - 3:00 PM' },
                { id: 5, name: 'Giza Water Branch', nameAr: 'فرع مياه الجيزة', governorate: 'giza', address: 'Dokki', currentNumber: 8, waiting: 3, estimatedTime: 30, workingHours: '8:00 AM - 3:00 PM' },
                { id: 6, name: 'Alexandria Water', nameAr: 'مياه الإسكندرية', governorate: 'alexandria', address: 'Sidi Gaber', currentNumber: 25, waiting: 15, estimatedTime: 150, workingHours: '8:00 AM - 3:00 PM' }
            ]
        },
        gas: {
            name: 'Natural Gas',
            nameAr: 'الغاز الطبيعي',
            fullName: 'Egyptian Natural Gas Company',
            icon: 'fas fa-fire',
            branches: [
                { id: 7, name: 'Cairo Gas Center', nameAr: 'مركز غاز القاهرة', governorate: 'cairo', address: 'Heliopolis', currentNumber: 30, waiting: 10, estimatedTime: 100, workingHours: '9:00 AM - 5:00 PM' },
                { id: 8, name: 'Giza Gas Services', nameAr: 'خدمات غاز الجيزة', governorate: 'giza', address: 'Mohandessin', currentNumber: 14, waiting: 7, estimatedTime: 70, workingHours: '9:00 AM - 5:00 PM' },
                { id: 9, name: 'Alexandria Gas', nameAr: 'غاز الإسكندرية', governorate: 'alexandria', address: 'Smouha', currentNumber: 19, waiting: 9, estimatedTime: 90, workingHours: '9:00 AM - 5:00 PM' }
            ]
        },
        telecom: {
            name: 'Telecommunications',
            nameAr: 'الاتصالات',
            fullName: 'Telecom Egypt Services',
            icon: 'fas fa-phone',
            branches: [
                { id: 10, name: 'Cairo Telecom Hub', nameAr: 'مركز اتصالات القاهرة', governorate: 'cairo', address: 'Zamalek', currentNumber: 45, waiting: 20, estimatedTime: 200, workingHours: '8:00 AM - 6:00 PM' },
                { id: 11, name: 'Giza Telecom', nameAr: 'اتصالات الجيزة', governorate: 'giza', address: 'Agouza', currentNumber: 33, waiting: 12, estimatedTime: 120, workingHours: '8:00 AM - 6:00 PM' },
                { id: 12, name: 'Alexandria Telecom', nameAr: 'اتصالات الإسكندرية', governorate: 'alexandria', address: 'Gleem', currentNumber: 28, waiting: 8, estimatedTime: 80, workingHours: '8:00 AM - 6:00 PM' }
            ]
        },
        internet: {
            name: 'Internet Services',
            nameAr: 'الإنترنت',
            fullName: 'Internet Service Providers',
            icon: 'fas fa-wifi',
            branches: [
                { id: 13, name: 'Cairo Internet Services', nameAr: 'خدمات إنترنت القاهرة', governorate: 'cairo', address: 'New Cairo', currentNumber: 16, waiting: 4, estimatedTime: 40, workingHours: '9:00 AM - 5:00 PM' },
                { id: 14, name: 'Giza Internet Center', nameAr: 'مركز إنترنت الجيزة', governorate: 'giza', address: '6th October', currentNumber: 21, waiting: 11, estimatedTime: 110, workingHours: '9:00 AM - 5:00 PM' },
                { id: 15, name: 'Alexandria Internet', nameAr: 'إنترنت الإسكندرية', governorate: 'alexandria', address: 'Montaza', currentNumber: 37, waiting: 18, estimatedTime: 180, workingHours: '9:00 AM - 5:00 PM' }
            ]
        },
        test: {
            name: 'Test Company',
            nameAr: 'شركة الاختبار',
            fullName: 'Test Company Services',
            icon: 'fas fa-flask',
            branches: [
                { id: 16, name: 'Cairo Test Center', nameAr: 'مركز اختبار القاهرة', governorate: 'cairo', address: 'Maadi', currentNumber: 5, waiting: 3, estimatedTime: 30, workingHours: '10:00 AM - 6:00 PM' },
                { id: 17, name: 'Giza Test Branch', nameAr: 'فرع اختبار الجيزة', governorate: 'giza', address: 'Sheikh Zayed', currentNumber: 12, waiting: 7, estimatedTime: 70, workingHours: '10:00 AM - 6:00 PM' },
                { id: 18, name: 'Alexandria Test Office', nameAr: 'مكتب اختبار الإسكندرية', governorate: 'alexandria', address: 'Stanley', currentNumber: 8, waiting: 2, estimatedTime: 20, workingHours: '10:00 AM - 6:00 PM' },
                { id: 19, name: 'Luxor Test Center', nameAr: 'مركز اختبار الأقصر', governorate: 'luxor', address: 'East Bank', currentNumber: 3, waiting: 1, estimatedTime: 10, workingHours: '9:00 AM - 4:00 PM' },
                { id: 20, name: 'Aswan Test Branch', nameAr: 'فرع اختبار أسوان', governorate: 'aswan', address: 'Corniche', currentNumber: 15, waiting: 9, estimatedTime: 90, workingHours: '9:00 AM - 4:00 PM' }
            ]
        }
    };
}

// Function to save companies data to localStorage
function saveCompaniesData() {
    localStorage.setItem('companiesData', JSON.stringify(companies));
}

// Admin credentials
const adminCredentials = {
    'Water1Egypt': { password: '1234w', company: 'water' },
    'Electricity1Egypt': { password: '1234e', company: 'electricity' },
    'Test1Egypt': { password: '1234t', company: 'test' },
    'Telecom1Egypt': { password: '1234c', company: 'telecom' },
    'Gas1Egypt': { password: '1234g', company: 'gas' },
    'Internet1Egypt': { password: '1234i', company: 'internet' }
};

// Utility functions
function goHome() {
    window.location.href = 'index.html';
}

function startBooking() {
    window.location.href = 'companies.html';
}

// Enhanced Company Selection
function selectCompany(companyId, event) {
    try {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        if (!companies[companyId]) {
            showToast('Error', 'Invalid company selection', 'error');
            return;
        }
        
        selectedCompany = companyId;
        localStorage.setItem('selectedCompany', companyId);
        
        let companyCard;
        if (event && event.currentTarget) {
            companyCard = event.currentTarget;
        } else {
            companyCard = document.querySelector(`[data-company="${companyId}"]`);
        }
        
        if (companyCard) {
            companyCard.style.transform = 'scale(0.95)';
            companyCard.style.transition = 'transform 0.2s ease';
            
            setTimeout(() => {
                companyCard.style.transform = 'scale(1)';
                showToast('Company Selected', `You selected ${companies[companyId].name}`, 'success', 2000);
                
                setTimeout(() => {
                    window.location.href = 'branches.html';
                }, 500);
            }, 200);
        } else {
            showToast('Company Selected', `You selected ${companies[companyId].name}`, 'success', 2000);
            setTimeout(() => {
                window.location.href = 'branches.html';
            }, 500);
        }
    } catch (error) {
        console.error('Error selecting company:', error);
        showToast('Error', 'Failed to select company. Please try again.', 'error');
    }
}

// Enhanced Branch Selection
function selectBranch(branchId, event) {
    try {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        selectedBranch = branchId;
        localStorage.setItem('selectedBranch', branchId);
        
        let branchCard;
        if (event && event.currentTarget) {
            branchCard = event.currentTarget;
        } else {
            branchCard = document.querySelector(`[data-branch="${branchId}"]`);
        }
        
        if (branchCard) {
            branchCard.style.transform = 'scale(0.95)';
            branchCard.style.transition = 'transform 0.2s ease';
            
            setTimeout(() => {
                branchCard.style.transform = 'scale(1)';
                showToast('Branch Selected', 'Proceeding to booking form', 'success', 2000);
                
                setTimeout(() => {
                    window.location.href = 'booking.html';
                }, 500);
            }, 200);
        } else {
            showToast('Branch Selected', 'Proceeding to booking form', 'success', 2000);
            setTimeout(() => {
                window.location.href = 'booking.html';
            }, 500);
        }
    } catch (error) {
        console.error('Error selecting branch:', error);
        showToast('Error', 'Failed to select branch. Please try again.', 'error');
    }
}

function bookAnother() {
    window.location.href = 'companies.html';
}

// Enhanced Refresh with Loading State
function refreshStatus() {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.style.pointerEvents = 'none';
        refreshBtn.style.transform = 'rotate(360deg)';
        
        showToast('Refreshing', 'Updating queue status...', 'info', 2000);
        
        setTimeout(() => {
            refreshBtn.style.transform = 'rotate(0deg)';
            refreshBtn.style.pointerEvents = 'auto';
            updateQueueNumbers();
            showToast('Updated', 'Queue status refreshed', 'success', 2000);
        }, 1000);
    }
}

// Enhanced Status Updates with Real-time Feel
function updateQueueNumbers() {
    const currentServing = document.getElementById('currentServing');
    const yourNumber = document.getElementById('yourNumber');
    const peopleAhead = document.getElementById('peopleAhead');
    const estimatedWait = document.getElementById('estimatedWait');
    
    if (currentServing && yourNumber) {
        const current = parseInt(currentServing.textContent);
        const your = parseInt(yourNumber.textContent);
        
        // Animate number change
        const newCurrent = current + Math.floor(Math.random() * 3);
        animateNumberChange(currentServing, current, newCurrent);
        
        const ahead = Math.max(0, your - newCurrent);
        const wait = ahead * 10; // 10 minutes per person
        
        if (peopleAhead) animateNumberChange(peopleAhead, parseInt(peopleAhead.textContent), ahead);
        if (estimatedWait) estimatedWait.textContent = wait;
        
        // Show notification if it's almost your turn
        if (ahead <= 3 && ahead > 0) {
            showToast('Almost Your Turn!', `Only ${ahead} people ahead of you`, 'warning');
        } else if (ahead === 0) {
            showToast('Your Turn!', 'Please proceed to the service counter', 'success');
            showConfetti();
        }
    }
}

function animateNumberChange(element, from, to) {
    const duration = 1000;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.round(from + (to - from) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Enhanced Search with Debouncing
function setupSearch() {
    const searchInput = document.getElementById('branchSearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                filterBranches(searchTerm);
                
                const visibleBranches = document.querySelectorAll('.branch-card:not([style*="display: none"])').length;
                showToast('Search Results', `Found ${visibleBranches} branches`, 'info', 2000);
            }, 300);
        });
    }
}

function filterByGovernorate(governorate) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const branches = document.querySelectorAll('.branch-card');
    branches.forEach(branch => {
        const branchGovernorate = branch.dataset.governorate;
        if (governorate === 'all' || branchGovernorate === governorate) {
            branch.style.display = 'block';
        } else {
            branch.style.display = 'none';
        }
    });
}

function filterBranches(searchTerm) {
    const branches = document.querySelectorAll('.branch-card');
    branches.forEach(branch => {
        const branchName = branch.querySelector('h4').textContent.toLowerCase();
        const branchLocation = branch.querySelector('p').textContent.toLowerCase();
        
        if (branchName.includes(searchTerm) || branchLocation.includes(searchTerm)) {
            branch.style.display = 'block';
        } else {
            branch.style.display = 'none';
        }
    });
}

// Form validation
function validateNationalId(id) {
    return /^\d{14}$/.test(id);
}

function validatePhoneNumber(phone) {
    return /^01[0-2,5]\d{8}$/.test(phone);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// REAL Email sending function using EmailJS
function sendConfirmationEmail(bookingData) {
    return new Promise((resolve, reject) => {
        // Check if EmailJS is configured
        if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
            console.error('EmailJS not configured properly');
            reject(new Error('Email service not configured'));
            return;
        }

        // Prepare email template parameters
        const templateParams = {
            to_email: bookingData.email,
            to_name: bookingData.fullName,
            queue_number: bookingData.queueNumber,
            service_type: bookingData.serviceType,
            company_name: bookingData.companyName,
            branch_name: bookingData.branchName,
            branch_address: bookingData.branchAddress || 'N/A',
            phone_number: bookingData.phoneNumber,
            national_id: bookingData.nationalId,
            booking_time: bookingData.bookingTime,
            estimated_wait: bookingData.waitingTime,
            current_number: bookingData.currentNumber || 'N/A',
            people_waiting: bookingData.peopleWaiting || 'N/A'
        };

        console.log('📧 Sending email with params:', templateParams);

        // Send email using EmailJS
        emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams,
            EMAILJS_CONFIG.publicKey
        ).then(
            function(response) {
                console.log('✅ Email sent successfully:', response.status, response.text);
                resolve(true);
            },
            function(error) {
                console.error('❌ Failed to send email:', error);
                reject(error);
            }
        );
    });
}

// Enhanced Form Submission with REAL Email functionality
function handleBookingSubmission(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    setLoadingState(submitBtn, true);
    
    const formData = new FormData(e.target);
    const fullName = formData.get('fullName');
    const nationalId = formData.get('nationalId');
    const phoneNumber = formData.get('phoneNumber');
    const email = formData.get('email');
    const serviceType = formData.get('serviceType');
    
    // Validate form data
    if (!validateNationalId(nationalId)) {
        showToast('Validation Error', 'Please enter a valid 14-digit National ID', 'error');
        setLoadingState(submitBtn, false);
        return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
        showToast('Validation Error', 'Please enter a valid Egyptian phone number', 'error');
        setLoadingState(submitBtn, false);
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Validation Error', 'Please enter a valid email address', 'error');
        setLoadingState(submitBtn, false);
        return;
    }
    
    // Simulate API call
    setTimeout(async () => {
        const companyId = localStorage.getItem('selectedCompany');
        const branchId = localStorage.getItem('selectedBranch');
        const company = companies[companyId];
        const branch = company.branches.find(b => b.id == branchId);
        
        // Calculate queue number and waiting time
        const queueNumber = branch.currentNumber + branch.waiting + 1;
        const waitingTime = branch.waiting * 10; // 10 minutes per person
        
        // Store booking data
        const bookingData = {
            fullName,
            nationalId,
            phoneNumber,
            email,
            serviceType,
            queueNumber,
            waitingTime,
            bookingTime: new Date().toLocaleString(),
            company: companyId,
            branch: branchId,
            companyName: company.name,
            branchName: branch.name,
            branchAddress: `${branch.address}, ${branch.governorate}`,
            currentNumber: branch.currentNumber,
            peopleWaiting: branch.waiting
        };
        
        localStorage.setItem('bookingData', JSON.stringify(bookingData));
        
        // Send REAL confirmation email
        try {
            showToast('Sending Email', 'Sending confirmation email...', 'info', 3000);
            await sendConfirmationEmail(bookingData);
            showToast('Email Sent!', `Confirmation email sent to ${email}`, 'success', 4000);
        } catch (error) {
            console.error('Email error:', error);
            showToast('Email Warning', 'Booking confirmed but email could not be sent. Please check your email configuration.', 'warning', 5000);
        }
        
        showToast('Success!', 'Your booking has been confirmed', 'success');
        showConfetti();
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = 'status.html';
        }, 2000);
        
        setLoadingState(submitBtn, false);
    }, 2000);
}

function initializePage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Initialize enhanced features
    initializeEnhancedFeatures();
    
    switch(currentPage) {
        case 'branches.html':
            initializeBranchesPage();
            break;
        case 'booking.html':
            initializeBookingPage();
            break;
        case 'status.html':
            initializeStatusPage();
            break;
        case 'admin.html':
            initializeAdminPage();
            break;
        default:
            // Home page animations
            setTimeout(() => {
                document.querySelectorAll('.feature').forEach((feature, index) => {
                    if (feature) {
                        feature.style.animationDelay = `${index * 0.2}s`;
                        feature.classList.add('slide-in-up');
                    }
                });
            }, 500);
    }
}

function initializeBookingPage() {
    const companyId = localStorage.getItem('selectedCompany');
    const branchId = localStorage.getItem('selectedBranch');
    
    if (!companyId || !branchId) {
        window.location.href = 'companies.html';
        return;
    }
    
    const company = companies[companyId];
    const branch = company.branches.find(b => b.id == branchId);
    
    if (!branch) {
        window.location.href = 'branches.html';
        return;
    }
    
    // Update page content
    const selectedCompanyEl = document.getElementById('selectedCompany');
    const selectedBranchEl = document.getElementById('selectedBranch');
    const branchIcon = document.getElementById('branchIcon');
    const currentNumber = document.getElementById('currentNumber');
    const waitingCount = document.getElementById('waitingCount');
    const estimatedTime = document.getElementById('estimatedTime');
    
    if (selectedCompanyEl) selectedCompanyEl.textContent = company.name;
    if (selectedBranchEl) selectedBranchEl.textContent = branch.name;
    if (branchIcon) branchIcon.innerHTML = `<i class="${company.icon}"></i>`;
    if (currentNumber) currentNumber.textContent = branch.currentNumber;
    if (waitingCount) waitingCount.textContent = branch.waiting;
    if (estimatedTime) estimatedTime.textContent = branch.estimatedTime;
    
    // Setup form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmission);
    }
}

function initializeBranchesPage() {
    const companyId = localStorage.getItem('selectedCompany');
    if (!companyId || !companies[companyId]) {
        window.location.href = 'companies.html';
        return;
    }
    
    const company = companies[companyId];
    const companyTitle = document.getElementById('companyTitle');
    if (companyTitle) {
        companyTitle.textContent = `${company.name} Branches`;
    }
    
    // Populate branches
    const branchesContainer = document.getElementById('branchesContainer');
    if (branchesContainer) {
        branchesContainer.innerHTML = '';
        
        company.branches.forEach(branch => {
            const branchCard = createBranchCard(branch, company);
            branchesContainer.appendChild(branchCard);
        });
    }
    
    setupSearch();
}

function createBranchCard(branch, company) {
    const card = document.createElement('div');
    card.className = 'branch-card';
    card.dataset.governorate = branch.governorate;
    card.dataset.branch = branch.id;
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.3s ease';
    
    // Add hover effects
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
        this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    });
    
    // Bind click event
    card.addEventListener('click', function(event) {
        selectBranch(branch.id, event);
    });
    
    card.innerHTML = `
        <div class="branch-header">
            <div class="branch-info">
                <h4>${branch.name}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${branch.address}, ${branch.governorate.charAt(0).toUpperCase() + branch.governorate.slice(1)}</p>
                <p><i class="fas fa-clock"></i> ${branch.workingHours}</p>
            </div>
            <div class="branch-status">
                <span class="status-indicator active"></span>
                <span>Open</span>
            </div>
        </div>
        <div class="branch-stats">
            <div class="stat">
                <span class="stat-number">${branch.currentNumber}</span>
                <span class="stat-label">Current</span>
            </div>
            <div class="stat">
                <span class="stat-number">${branch.waiting}</span>
                <span class="stat-label">Waiting</span>
            </div>
            <div class="stat">
                <span class="stat-number">${branch.estimatedTime}min</span>
                <span class="stat-label">Est. Time</span>
            </div>
        </div>
        <div class="branch-action">
            <i class="fas fa-arrow-right"></i>
        </div>
    `;
    
    return card;
}

function initializeStatusPage() {
    const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');
    const companyId = localStorage.getItem('selectedCompany');
    const branchId = localStorage.getItem('selectedBranch');
    
    if (!bookingData.queueNumber || !companyId || !branchId) {
        window.location.href = 'index.html';
        return;
    }
    
    const company = companies[companyId];
    const branch = company.branches.find(b => b.id == branchId);
    
    // Update status display
    const currentServing = document.getElementById('currentServing');
    const yourNumber = document.getElementById('yourNumber');
    const peopleAhead = document.getElementById('peopleAhead');
    const estimatedWait = document.getElementById('estimatedWait');
    const branchLocation = document.getElementById('branchLocation');
    
    const currentNumber = branch.currentNumber;
    const yourQueueNumber = bookingData.queueNumber;
    const ahead = Math.max(0, yourQueueNumber - currentNumber);
    const wait = ahead * 10; // 10 minutes per person
    
    if (currentServing) currentServing.textContent = currentNumber;
    if (yourNumber) yourNumber.textContent = yourQueueNumber;
    if (peopleAhead) peopleAhead.textContent = ahead;
    if (estimatedWait) estimatedWait.textContent = wait;
    if (branchLocation) branchLocation.textContent = branch.name;
    
    // Update booking details
    const userName = document.getElementById('userName');
    const userPhone = document.getElementById('userPhone');
    const serviceTypeEl = document.getElementById('serviceType');
    const bookingDate = document.getElementById('bookingDate');
    
    if (userName) userName.textContent = bookingData.fullName;
    if (userPhone) userPhone.textContent = bookingData.phoneNumber;
    if (serviceTypeEl) serviceTypeEl.textContent = bookingData.serviceType;
    if (bookingDate) bookingDate.textContent = bookingData.bookingTime;
}

function initializeAdminPage() {
    // Check if admin is already logged in
    const savedAdmin = localStorage.getItem('currentAdmin');
    if (savedAdmin) {
        currentAdmin = JSON.parse(savedAdmin);
        showAdminDashboard();
        return;
    }
    
    const adminForm = document.getElementById('adminLoginForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }
}

// Handle page visibility change for auto-refresh
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && window.location.pathname.includes('status.html')) {
        updateQueueNumbers();
    }
});

// Enhanced online/offline handling
window.addEventListener('online', function() {
    document.body.classList.remove('offline');
});

window.addEventListener('offline', function() {
    document.body.classList.add('offline');
});

// Export functions for global access
window.goHome = goHome;
window.startBooking = startBooking;
window.selectCompany = selectCompany;
window.selectBranch = selectBranch;
window.bookAnother = bookAnother;
window.refreshStatus = refreshStatus;
window.filterByGovernorate = filterByGovernorate;
window.toggleTheme = toggleTheme;
window.initializeTheme = initializeTheme;
window.showToast = showToast;
window.showConfetti = showConfetti;
window.setLoadingState = setLoadingState;
window.closeToast = closeToast;

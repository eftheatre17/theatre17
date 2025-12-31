// ========================================
// THEATRE 17 - JavaScript Principal
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation du carrousel
    initCarousel();
    
    // Menu mobile
    initMobileMenu();
    
    // Animations au scroll
    initScrollAnimations();
    
    // Smooth scroll pour les ancres
    initSmoothScroll();
});

// ========================================
// CARROUSEL
// ========================================

function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    const carouselInner = carousel.querySelector('.carousel-inner');
    const items = carousel.querySelectorAll('.carousel-item');
    const indicators = carousel.querySelectorAll('.indicator');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    
    let currentIndex = 0;
    const totalItems = items.length;
    let autoplayInterval;
    
    // Fonction pour mettre à jour le carrousel
    function updateCarousel() {
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Mettre à jour les indicateurs
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Fonction pour aller à une slide spécifique
    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
        resetAutoplay();
    }
    
    // Fonction pour la slide suivante
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }
    
    // Fonction pour la slide précédente
    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    }
    
    // Fonction pour démarrer l'autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 5000);
    }
    
    // Fonction pour arrêter l'autoplay
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    // Fonction pour réinitialiser l'autoplay
    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }
    
    // Événements sur les boutons
    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });
    
    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });
    
    // Événements sur les indicateurs
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
    });
    
    // Pause sur hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    
    // Démarrer l'autoplay
    startAutoplay();
}

// ========================================
// MENU MOBILE
// ========================================

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (!menuToggle || !navMenu) return;
    
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Changement d'icône
        const icon = menuToggle.textContent;
        menuToggle.textContent = icon === '☰' ? '✕' : '☰';
    });
    
    // Fermer le menu en cliquant sur un lien
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            menuToggle.textContent = '☰';
        });
    });
    
    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.textContent = '☰';
        }
    });
}

// ========================================
// ANIMATIONS AU SCROLL
// ========================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ========================================
// SMOOTH SCROLL
// ========================================

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// UTILITAIRES
// ========================================

// Fonction pour afficher un message de confirmation
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Styles CSS pour la notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '600',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else {
        notification.style.backgroundColor = '#17a2b8';
    }
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression après 3 secondes
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Protection contre le spam sur les formulaires
function initFormProtection() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Ajouter un champ honeypot invisible
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.display = 'none';
        honeypot.setAttribute('aria-hidden', 'true');
        
        form.appendChild(honeypot);
        
        // Vérifier la soumission
        form.addEventListener('submit', function(e) {
            if (honeypot.value !== '') {
                e.preventDefault();
                console.log('Spam détecté');
                return false;
            }
        });
    });
}

// Initialiser la protection des formulaires
document.addEventListener('DOMContentLoaded', initFormProtection);
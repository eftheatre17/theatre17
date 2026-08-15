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

    // Formulaires Google chargés uniquement sur accord du visiteur
    initConsentForms();
});

// ========================================
// FORMULAIRES SOUS CONSENTEMENT
// ========================================

// Les formulaires de préinscription sont hébergés par Google, qui dépose
// des cookies dès l'affichage. On ne charge donc l'iframe qu'après un clic
// explicite : tant que le visiteur n'a rien demandé, aucune requête n'est
// envoyée à Google.
function initConsentForms() {
    const blocs = document.querySelectorAll('.form-consent');

    blocs.forEach(bloc => {
        const bouton = bloc.querySelector('.js-charger-formulaire');
        const url = bloc.dataset.formUrl;

        if (!bouton || !url) return;

        const texte = bloc.querySelector('.form-consent__texte');
        const actions = bloc.querySelector('.form-consent__actions');
        const alternative = bloc.querySelector('.form-consent__alternative');

        bouton.addEventListener('click', function() {
            // On masque l'explication et les boutons, mais on laisse la
            // solution de repli affichée : si Google est bloque par le
            // navigateur (protection anti-pistage, mode restreint), le
            // visiteur garde un moyen de s'inscrire.
            if (texte) texte.hidden = true;
            if (actions) actions.hidden = true;

            // Zone d'annonce : les lecteurs d'ecran signalent le chargement
            // puis l'arrivee du formulaire, sans deplacer le focus de force.
            const statut = document.createElement('p');
            statut.className = 'form-consent__statut';
            statut.setAttribute('role', 'status');
            statut.tabIndex = -1;
            statut.textContent = 'Chargement du formulaire…';
            bloc.insertBefore(statut, alternative);
            statut.focus();

            const iframe = document.createElement('iframe');
            iframe.src = url + (url.includes('?') ? '&' : '?') + 'embedded=true';
            iframe.title = bloc.dataset.formTitre || 'Formulaire de préinscription';
            iframe.className = 'form-iframe';

            let abouti = false;

            iframe.addEventListener('load', function() {
                abouti = true;
                statut.textContent = 'Formulaire chargé.';
            });

            // Une iframe bloquee ne declenche jamais d'erreur : elle reste
            // simplement vide. On previent donc au bout d'un delai.
            setTimeout(function() {
                if (!abouti) {
                    statut.textContent =
                        "Le formulaire met du temps à s'afficher, ou votre navigateur le bloque. " +
                        'Utilisez un des liens ci-dessous.';
                }
            }, 8000);

            bloc.insertBefore(iframe, alternative);
        });
    });
}

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
    const pauseBtn = carousel.querySelector('.carousel-pause');

    let currentIndex = 0;
    const totalItems = items.length;
    let autoplayInterval = null;

    // Un visiteur qui a demandé à réduire les animations ne doit pas subir
    // de défilement automatique.
    const animationsReduites = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let enPause = animationsReduites;

    // Fonction pour mettre à jour le carrousel
    function updateCarousel() {
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Mettre à jour les indicateurs
        indicators.forEach((indicator, index) => {
            const actif = index === currentIndex;
            indicator.classList.toggle('active', actif);
            indicator.setAttribute('aria-selected', actif ? 'true' : 'false');
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
        if (enPause) return;
        stopAutoplay();
        autoplayInterval = setInterval(nextSlide, 5000);
    }

    // Fonction pour arrêter l'autoplay
    function stopAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }

    // Fonction pour réinitialiser l'autoplay
    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Bouton pause : exigence d'accessibilité pour tout contenu
    // qui s'anime automatiquement plus de cinq secondes.
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            enPause = !enPause;
            if (enPause) {
                stopAutoplay();
                pauseBtn.textContent = '▶';
                pauseBtn.setAttribute('aria-label', 'Relancer le défilement du carrousel');
            } else {
                startAutoplay();
                pauseBtn.textContent = '❚❚';
                pauseBtn.setAttribute('aria-label', 'Mettre le carrousel en pause');
            }
        });

        if (animationsReduites) {
            pauseBtn.textContent = '▶';
            pauseBtn.setAttribute('aria-label', 'Relancer le défilement du carrousel');
        }
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
    
    // Pause au survol et à la navigation clavier
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);
    
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
    
    // Synchronise l'état visuel et l'état annoncé aux lecteurs d'écran
    function setMenu(ouvert) {
        navMenu.classList.toggle('active', ouvert);
        menuToggle.textContent = ouvert ? '✕' : '☰';
        menuToggle.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
        menuToggle.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    }

    menuToggle.addEventListener('click', function() {
        setMenu(!navMenu.classList.contains('active'));
    });

    // Fermeture au clavier
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            setMenu(false);
            menuToggle.focus();
        }
    });
    
    // Fermer le menu en cliquant sur un lien
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            setMenu(false);
        });
    });
    
    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
            setMenu(false);
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
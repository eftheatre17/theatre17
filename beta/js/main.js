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

    // Bandeau de consentement + affichage conditionnel des formulaires
    initCookies();
});

// ========================================
// CONSENTEMENT AUX COOKIES TIERS
// ========================================

// Le site ne dépose aucun cookie de son fait. Seuls les formulaires
// Google Forms en déposent, et uniquement s'ils sont affichés. Le bandeau
// recueille donc un consentement unique, valable pour tout le site.
//
// Le choix est conservé dans localStorage plutôt que dans un cookie : c'est
// un stockage strictement nécessaire au respect du choix de l'utilisateur,
// donc lui-même exempt de consentement.
function initCookies() {
    const CLE = 'theatre17-cookies';
    const bandeau = document.getElementById('bandeau-cookies');
    const zones = document.querySelectorAll('.form-zone');
    let declencheur = null;

    // localStorage lève une exception en navigation privée sur certains
    // navigateurs : on dégrade sans casser le reste de la page.
    function lireChoix() {
        try { return localStorage.getItem(CLE); } catch (e) { return null; }
    }

    function ecrireChoix(valeur) {
        try { localStorage.setItem(CLE, valeur); } catch (e) { /* sans effet */ }
    }

    function afficherFormulaires() {
        zones.forEach(zone => {
            if (zone.querySelector('.form-iframe')) return;

            const url = zone.dataset.formUrl;
            if (!url) return;

            const repli = zone.querySelector('.form-repli');
            if (repli) repli.hidden = true;

            const statut = document.createElement('p');
            statut.className = 'form-zone__statut';
            statut.setAttribute('role', 'status');
            statut.textContent = 'Chargement du formulaire\u2026';
            zone.appendChild(statut);

            const iframe = document.createElement('iframe');
            iframe.src = url + (url.includes('?') ? '&' : '?') + 'embedded=true';
            iframe.title = zone.dataset.formTitre || 'Formulaire de préinscription';
            iframe.className = 'form-iframe';

            const texteRepli = repli ? repli.querySelector('.form-repli__texte') : null;
            const texteOrigine = texteRepli ? texteRepli.innerHTML : null;

            let abouti = false;
            iframe.addEventListener('load', function () {
                abouti = true;
                statut.remove();
                // Le formulaire a fini par arriver, même tardivement : on
                // remasque le repli pour ne pas afficher deux messages
                // contradictoires l'un au-dessus de l'autre.
                if (repli) {
                    repli.hidden = true;
                    if (texteRepli && texteOrigine) texteRepli.innerHTML = texteOrigine;
                }
            });

            // Une iframe bloquée par le navigateur ne déclenche aucune erreur :
            // elle reste simplement vide. On propose donc une porte de sortie
            // au bout d'un délai, en reformulant le repli — son texte d'origine
            // parle d'un refus de cookies, ce qui n'est pas le cas ici.
            setTimeout(function () {
                if (abouti) return;
                statut.remove();
                if (repli) {
                    if (texteRepli) {
                        texteRepli.textContent = "Le formulaire tarde à s'afficher, ou votre "
                            + 'navigateur le bloque. Vous pouvez vous inscrire autrement :';
                    }
                    repli.hidden = false;
                }
            }, 8000);

            zone.appendChild(iframe);
        });
    }

    function retirerFormulaires() {
        zones.forEach(zone => {
            zone.querySelectorAll('.form-iframe, .form-zone__statut').forEach(e => e.remove());
            const repli = zone.querySelector('.form-repli');
            if (repli) repli.hidden = false;
        });
    }

    function ouvrirBandeau(origine) {
        if (!bandeau) return;
        declencheur = origine || null;
        bandeau.hidden = false;
        const premier = bandeau.querySelector('button');
        if (premier && origine) premier.focus();
    }

    function fermerBandeau() {
        if (!bandeau) return;
        bandeau.hidden = true;
        if (declencheur) {
            declencheur.focus();
            declencheur = null;
        }
    }

    function appliquer(choix) {
        if (choix === 'accepte') {
            afficherFormulaires();
        } else {
            retirerFormulaires();
        }
    }

    // État initial
    const choixInitial = lireChoix();
    if (choixInitial) {
        appliquer(choixInitial);
    } else {
        ouvrirBandeau(null);
    }

    if (bandeau) {
        const accepter = bandeau.querySelector('.js-cookies-accepter');
        const refuser = bandeau.querySelector('.js-cookies-refuser');

        if (accepter) accepter.addEventListener('click', function () {
            ecrireChoix('accepte');
            appliquer('accepte');
            fermerBandeau();
        });

        if (refuser) refuser.addEventListener('click', function () {
            ecrireChoix('refuse');
            appliquer('refuse');
            fermerBandeau();
            // Information ponctuelle sur la conséquence du refus. Déclenchée
            // par le clic, donc jamais réaffichée d'elle-même par la suite.
            ouvrirModale();
        });

        // Échap vaut refus tacite : on referme sans rien enregistrer,
        // le bandeau réapparaîtra à la prochaine visite.
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !bandeau.hidden) fermerBandeau();
        });
    }

    // « Gérer les cookies » — pied de page et pages d'inscription
    document.querySelectorAll('.js-cookies-rouvrir').forEach(bouton => {
        bouton.addEventListener('click', function () {
            ouvrirBandeau(bouton);
        });
    });

    // ---- Modale d'information affichée après un refus ----

    const modale = document.getElementById('modale-cookies');

    function ouvrirModale() {
        if (!modale) return;
        // showModal() apporte le piège à focus, la fermeture par Échap et
        // l'inertie de l'arrière-plan. Repli sur un affichage simple si le
        // navigateur ne le gère pas.
        if (typeof modale.showModal === 'function') {
            modale.showModal();
        } else {
            modale.setAttribute('open', '');
        }
        // On se place au début du contenu : sur un petit écran, le
        // navigateur ferait sinon défiler jusqu'au premier bouton et
        // masquerait le titre.
        modale.focus();
        modale.scrollTop = 0;
    }

    function fermerModale() {
        if (!modale) return;
        if (typeof modale.close === 'function') {
            modale.close();
        } else {
            modale.removeAttribute('open');
        }
    }

    if (modale) {
        const continuer = modale.querySelector('.js-modale-continuer');
        const accepterFinalement = modale.querySelector('.js-modale-accepter');

        if (continuer) continuer.addEventListener('click', fermerModale);

        if (accepterFinalement) accepterFinalement.addEventListener('click', function () {
            ecrireChoix('accepte');
            appliquer('accepte');
            fermerModale();
        });
    }
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
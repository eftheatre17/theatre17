// ========================================
// THEATRE 17 - JavaScript Principal
// ========================================

(() => {
    'use strict';

    const CLE_COOKIES = 'theatre17-cookies';
    const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
    const DUREE_SLIDE = 6500;

    document.addEventListener('DOMContentLoaded', () => {
        initHeaderScroll();
        initMenuMobile();
        initAncresAccessibles();
        initPlateauStage();
        initFiltreCours();
        initCopie();
        initCookies();
    });

    // Ombre douce de l'en-tête au défilement
    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;
        const maj = () => header.classList.toggle('header--solide', window.scrollY > 16);
        maj();
        window.addEventListener('scroll', maj, { passive: true });
    }

    // Menu mobile
    function initMenuMobile() {
        const toggle = document.querySelector('.menu-toggle');
        const menu = document.getElementById('menu-principal');
        if (!toggle || !menu) return;

        const mqDesktop = window.matchMedia('(min-width: 861px)');

        function setOuvert(ouvert) {
            menu.classList.toggle('is-open', ouvert);
            document.body.classList.toggle('menu-open', ouvert);
            toggle.setAttribute('aria-expanded', String(ouvert));
            toggle.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
            toggle.textContent = ouvert ? 'Fermer ✕' : 'Menu';
        }

        toggle.addEventListener('click', () => setOuvert(!menu.classList.contains('is-open')));
        menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOuvert(false)));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) {
                setOuvert(false);
                toggle.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (
                menu.classList.contains('is-open') &&
                !menu.contains(e.target) &&
                !toggle.contains(e.target)
            ) {
                setOuvert(false);
            }
        });

        mqDesktop.addEventListener('change', (e) => {
            if (e.matches && menu.classList.contains('is-open')) setOuvert(false);
        });
    }

    // Lien d'évitement et ancres internes : transfert effectif du focus
    function initAncresAccessibles() {
        document.querySelectorAll('a[href^="#"]').forEach((lien) => {
            const id = lien.getAttribute('href').slice(1);
            if (!id) return;
            const cible = document.getElementById(id);
            if (!cible) return;

            lien.addEventListener('click', (e) => {
                e.preventDefault();
                if (!cible.hasAttribute('tabindex')) cible.setAttribute('tabindex', '-1');
                cible.scrollIntoView({
                    behavior: REDUCED_MOTION.matches ? 'auto' : 'smooth',
                    block: 'start',
                });
                cible.focus({ preventScroll: true });
            });
        });
    }

    // Scène cross-fade + barre de progression + swipe tactile + clavier
    function initPlateauStage() {
        const stage = document.querySelector('[data-plateau]');
        if (!stage) return;

        const ecran = stage.querySelector('.scene-stage__ecran');
        const frames = Array.from(stage.querySelectorAll('.scene-stage__frame'));
        const pistes = Array.from(stage.querySelectorAll('.piste-btn'));
        const titreEl = stage.querySelector('[data-stage-titre]');
        const texteEl = stage.querySelector('[data-stage-texte]');
        const prevBtn = stage.querySelector('[data-stage-prev]');
        const nextBtn = stage.querySelector('[data-stage-next]');
        const pauseBtn = stage.querySelector('[data-stage-pause]');

        let index = 0;
        let timer = null;
        let enPause = REDUCED_MOTION.matches;
        let departX = null;

        function afficher(i) {
            index = (i + frames.length) % frames.length;

            frames.forEach((frame, idx) => {
                frame.classList.toggle('is-active', idx === index);
                frame.setAttribute('aria-hidden', String(idx !== index));
            });

            // Relance proprement l'animation de la barre de progression active
            pistes.forEach((btn, idx) => {
                btn.classList.remove('is-active');
                btn.setAttribute('aria-selected', String(idx === index));
            });
            void stage.offsetWidth;
            if (pistes[index]) pistes[index].classList.add('is-active');

            const active = frames[index];
            if (titreEl) titreEl.textContent = active.dataset.titre || '';
            if (texteEl) texteEl.textContent = active.dataset.texte || '';
        }

        function majPauseUI() {
            stage.classList.toggle('is-paused', enPause);
            if (!pauseBtn) return;
            pauseBtn.textContent = enPause ? '▶' : '❚❚';
            pauseBtn.setAttribute(
                'aria-label',
                enPause ? 'Relancer le défilement des scènes' : 'Mettre en pause le défilement'
            );
        }

        function arreter() {
            if (timer !== null) {
                window.clearTimeout(timer);
                timer = null;
            }
        }

        function planifier() {
            arreter();
            if (enPause || document.hidden) return;
            timer = window.setTimeout(() => {
                afficher(index + 1);
                planifier();
            }, DUREE_SLIDE);
        }

        if (prevBtn) prevBtn.addEventListener('click', () => { afficher(index - 1); planifier(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { afficher(index + 1); planifier(); });

        pistes.forEach((btn, idx) => {
            btn.addEventListener('click', () => {
                afficher(idx);
                planifier();
            });
        });

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                enPause = !enPause;
                majPauseUI();
                if (enPause) arreter(); else { afficher(index); planifier(); }
            });
        }

        stage.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); afficher(index - 1); planifier(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); afficher(index + 1); planifier(); }
            if (e.key === 'Home') { e.preventDefault(); afficher(0); planifier(); }
            if (e.key === 'End') { e.preventDefault(); afficher(frames.length - 1); planifier(); }
        });

        if (ecran) {
            ecran.addEventListener('pointerdown', (e) => { departX = e.clientX; arreter(); });
            ecran.addEventListener('pointerup', (e) => {
                if (departX === null) return;
                const delta = e.clientX - departX;
                departX = null;
                if (Math.abs(delta) > 40) afficher(delta < 0 ? index + 1 : index - 1);
                planifier();
            });
            ecran.addEventListener('pointercancel', () => { departX = null; planifier(); });
        }

        stage.addEventListener('mouseenter', arreter);
        stage.addEventListener('mouseleave', planifier);
        stage.addEventListener('focusin', arreter);
        stage.addEventListener('focusout', planifier);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) arreter(); else planifier();
        });

        majPauseUI();
        afficher(0);
        planifier();
    }

    // Filtre rapide par tranche d'âge (pages Dompierre et La Jarrie)
    function initFiltreCours() {
        const groupe = document.querySelector('[data-filtre-groupe]');
        if (!groupe) return;

        const boutons = Array.from(groupe.querySelectorAll('[data-filtre]'));
        const lignes = Array.from(groupe.querySelectorAll('.horaire-ligne[data-public]'));
        const statut = groupe.querySelector('[data-filtre-statut]');

        function appliquer(cat) {
            let n = 0;
            lignes.forEach((l) => {
                const ok = cat === 'tous' || l.dataset.public === cat;
                l.hidden = !ok;
                if (ok) n += 1;
            });
            boutons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtre === cat)));
            if (statut) statut.textContent = `${n} créneau${n > 1 ? 'x' : ''} affiché${n > 1 ? 's' : ''}`;
        }

        boutons.forEach((b) => b.addEventListener('click', () => appliquer(b.dataset.filtre)));
    }

    // Copie en un clic des coordonnées (page Contact)
    function initCopie() {
        document.querySelectorAll('[data-copier]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const val = btn.dataset.copier;
                const msg = btn.parentElement ? btn.parentElement.querySelector('.copie-msg') : null;
                try {
                    await navigator.clipboard.writeText(val);
                } catch {
                    const t = document.createElement('textarea');
                    t.value = val;
                    t.style.position = 'fixed';
                    t.style.opacity = '0';
                    document.body.appendChild(t);
                    t.select();
                    document.execCommand('copy');
                    t.remove();
                }
                if (msg) {
                    msg.textContent = 'Copié';
                    window.setTimeout(() => { msg.textContent = ''; }, 2200);
                }
            });
        });
    }

    // Consentement aux cookies tiers & affichage conditionnel Google Forms
    function initCookies() {
        const bandeau = document.getElementById('bandeau-cookies');
        const modale = document.getElementById('modale-cookies');
        const zones = Array.from(document.querySelectorAll('.form-zone'));
        const timers = new WeakMap();
        let declencheur = null;

        zones.forEach((z) => {
            const t = z.querySelector('.form-repli__texte');
            if (t && !t.dataset.origine) t.dataset.origine = t.innerHTML;
        });

        function lireChoix() {
            try { return localStorage.getItem(CLE_COOKIES); } catch { return null; }
        }

        function ecrireChoix(v) {
            try { localStorage.setItem(CLE_COOKIES, v); } catch { /* navigation privée */ }
        }

        function annulerTimer(z) {
            const id = timers.get(z);
            if (id) {
                window.clearTimeout(id);
                timers.delete(z);
            }
        }

        function restaurerRepli(z) {
            const repli = z.querySelector('.form-repli');
            const t = repli ? repli.querySelector('.form-repli__texte') : null;
            if (t && t.dataset.origine) t.innerHTML = t.dataset.origine;
            if (repli) repli.hidden = false;
        }

        function afficherFormulaires() {
            zones.forEach((zone) => {
                if (zone.querySelector('.form-iframe')) return;
                const url = zone.dataset.formUrl;
                if (!url) return;

                const repli = zone.querySelector('.form-repli');
                const t = repli ? repli.querySelector('.form-repli__texte') : null;
                if (repli) repli.hidden = true;

                const statut = document.createElement('p');
                statut.className = 'form-zone__statut';
                statut.setAttribute('role', 'status');
                statut.textContent = 'Chargement du formulaire\u2026';
                zone.appendChild(statut);

                const iframe = document.createElement('iframe');
                iframe.className = 'form-iframe';
                iframe.title = zone.dataset.formTitre || 'Formulaire de préinscription';
                iframe.src = `${url}${url.includes('?') ? '&' : '?'}embedded=true`;

                let charge = false;
                iframe.addEventListener('load', () => {
                    charge = true;
                    annulerTimer(zone);
                    statut.remove();
                    if (repli) {
                        repli.hidden = true;
                        if (t && t.dataset.origine) t.innerHTML = t.dataset.origine;
                    }
                });

                const id = window.setTimeout(() => {
                    if (charge) return;
                    statut.remove();
                    if (t) {
                        t.textContent =
                            "Le formulaire tarde à s'afficher, ou votre navigateur le bloque. Vous pouvez vous inscrire autrement :";
                    }
                    if (repli) repli.hidden = false;
                }, 8000);
                timers.set(zone, id);

                zone.appendChild(iframe);
            });
        }

        function retirerFormulaires() {
            zones.forEach((zone) => {
                annulerTimer(zone);
                zone.querySelectorAll('.form-iframe, .form-zone__statut').forEach((e) => e.remove());
                restaurerRepli(zone);
            });
        }

        function ouvrirBandeau(origine) {
            if (!bandeau) return;
            declencheur = origine || null;
            bandeau.hidden = false;
            if (origine) {
                const premier = bandeau.querySelector('button');
                if (premier) premier.focus();
            }
        }

        function fermerBandeau() {
            if (!bandeau) return;
            bandeau.hidden = true;
            if (declencheur) {
                declencheur.focus();
                declencheur = null;
            }
        }

        function ouvrirModale() {
            if (!modale) return;
            if (typeof modale.showModal === 'function') modale.showModal();
            else modale.setAttribute('open', '');
            modale.focus();
            modale.scrollTop = 0;
        }

        function fermerModale() {
            if (!modale) return;
            if (typeof modale.close === 'function') modale.close();
            else modale.removeAttribute('open');
        }

        function appliquer(choix) {
            if (choix === 'accepte') afficherFormulaires();
            else retirerFormulaires();
        }

        const initial = lireChoix();
        if (initial) appliquer(initial);
        else ouvrirBandeau(null);

        if (bandeau) {
            const accepter = bandeau.querySelector('.js-cookies-accepter');
            const refuser = bandeau.querySelector('.js-cookies-refuser');
            if (accepter) {
                accepter.addEventListener('click', () => {
                    ecrireChoix('accepte');
                    appliquer('accepte');
                    fermerBandeau();
                });
            }
            if (refuser) {
                refuser.addEventListener('click', () => {
                    ecrireChoix('refuse');
                    appliquer('refuse');
                    fermerBandeau();
                    ouvrirModale();
                });
            }
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !bandeau.hidden) fermerBandeau();
            });
        }

        if (modale) {
            const continuer = modale.querySelector('.js-modale-continuer');
            const accepter = modale.querySelector('.js-modale-accepter');
            if (continuer) continuer.addEventListener('click', fermerModale);
            if (accepter) {
                accepter.addEventListener('click', () => {
                    ecrireChoix('accepte');
                    appliquer('accepte');
                    fermerModale();
                });
            }
        }

        document.querySelectorAll('.js-cookies-rouvrir').forEach((b) => {
            b.addEventListener('click', () => ouvrirBandeau(b));
        });
    }
})();

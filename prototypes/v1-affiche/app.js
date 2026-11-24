/**
 * Théâtre 17 — Piste 01 : Affiche de Saison
 * JS modulaire sans dépendance, zéro code mort, zéro animation gadget au scroll.
 */
(() => {
    'use strict';

    const CLE_COOKIES = 'theatre17-proto-cookies';
    const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

    document.addEventListener('DOMContentLoaded', () => {
        initMenuMobile();
        initAncresAccessibles();
        initGalerie();
        initFiltreCours();
        initCopie();
        initCookies();
    });

    /* ---------- 1. Menu mobile ---------- */
    function initMenuMobile() {
        const toggle = document.querySelector('.menu-toggle');
        const menu = document.getElementById('menu-principal');
        if (!toggle || !menu) return;

        const mqDesktop = window.matchMedia('(min-width: 821px)');

        function setOuvert(ouvert) {
            menu.classList.toggle('is-open', ouvert);
            document.body.classList.toggle('menu-open', ouvert);
            toggle.setAttribute('aria-expanded', String(ouvert));
            toggle.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
            toggle.textContent = ouvert ? 'Fermer ✕' : 'Menu ☰';
        }

        toggle.addEventListener('click', () => {
            setOuvert(!menu.classList.contains('is-open'));
        });

        menu.querySelectorAll('a').forEach((lien) => {
            lien.addEventListener('click', () => setOuvert(false));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) {
                setOuvert(false);
                toggle.focus();
            }
        });

        mqDesktop.addEventListener('change', (e) => {
            if (e.matches && menu.classList.contains('is-open')) setOuvert(false);
        });
    }

    /* ---------- 2. Skip-link & ancres accessibles ---------- */
    function initAncresAccessibles() {
        document.querySelectorAll('a[href^="#"]').forEach((lien) => {
            const id = lien.getAttribute('href').slice(1);
            if (!id) return;
            const cible = document.getElementById(id);
            if (!cible) return;

            lien.addEventListener('click', (e) => {
                e.preventDefault();
                if (!cible.hasAttribute('tabindex')) {
                    cible.setAttribute('tabindex', '-1');
                }
                cible.scrollIntoView({
                    behavior: REDUCED_MOTION.matches ? 'auto' : 'smooth',
                    block: 'start',
                });
                cible.focus({ preventScroll: true });
            });
        });
    }

    /* ---------- 3. Galerie scénique chapitrée (swipe + clavier + pause) ---------- */
    function initGalerie() {
        const racine = document.querySelector('[data-galerie]');
        if (!racine) return;

        const viewport = racine.querySelector('.galerie__viewport');
        const piste = racine.querySelector('.galerie__piste');
        const slides = Array.from(racine.querySelectorAll('.galerie__slide'));
        const chapitres = Array.from(racine.querySelectorAll('.galerie__chapitre'));
        const titreEl = racine.querySelector('[data-galerie-titre]');
        const texteEl = racine.querySelector('[data-galerie-texte]');
        const prevBtn = racine.querySelector('[data-galerie-prev]');
        const nextBtn = racine.querySelector('[data-galerie-next]');
        const pauseBtn = racine.querySelector('[data-galerie-pause]');

        let index = 0;
        let timer = null;
        let enPause = REDUCED_MOTION.matches;
        let departX = null;

        function afficher(nouvelIndex) {
            index = (nouvelIndex + slides.length) % slides.length;
            piste.style.transform = `translateX(-${index * 100}%)`;

            const active = slides[index];
            if (titreEl) titreEl.textContent = active.dataset.titre || '';
            if (texteEl) texteEl.textContent = active.dataset.texte || '';

            chapitres.forEach((btn, i) => {
                const estActif = i === index;
                btn.classList.toggle('is-active', estActif);
                btn.setAttribute('aria-selected', String(estActif));
            });
        }

        function majBoutonPause() {
            if (!pauseBtn) return;
            pauseBtn.textContent = enPause ? '▶' : '❚❚';
            pauseBtn.setAttribute(
                'aria-label',
                enPause ? 'Relancer le défilement des photos' : 'Mettre en pause le défilement'
            );
        }

        function demarrer() {
            if (enPause || document.hidden) return;
            arreter();
            timer = window.setInterval(() => afficher(index + 1), 6500);
        }

        function arreter() {
            if (timer !== null) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prevBtn) prevBtn.addEventListener('click', () => { afficher(index - 1); demarrer(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { afficher(index + 1); demarrer(); });

        chapitres.forEach((btn, i) => {
            btn.addEventListener('click', () => {
                afficher(i);
                demarrer();
            });
        });

        if (pauseBtn) {
            majBoutonPause();
            pauseBtn.addEventListener('click', () => {
                enPause = !enPause;
                majBoutonPause();
                if (enPause) arreter(); else demarrer();
            });
        }

        // Clavier
        racine.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); afficher(index - 1); demarrer(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); afficher(index + 1); demarrer(); }
            if (e.key === 'Home') { e.preventDefault(); afficher(0); demarrer(); }
            if (e.key === 'End') { e.preventDefault(); afficher(slides.length - 1); demarrer(); }
        });

        // Swipe tactile / souris (Pointer Events)
        if (viewport) {
            viewport.addEventListener('pointerdown', (e) => {
                departX = e.clientX;
                arreter();
            });
            viewport.addEventListener('pointerup', (e) => {
                if (departX === null) return;
                const delta = e.clientX - departX;
                departX = null;
                if (Math.abs(delta) > 40) {
                    afficher(delta < 0 ? index + 1 : index - 1);
                }
                demarrer();
            });
            viewport.addEventListener('pointercancel', () => {
                departX = null;
                demarrer();
            });
        }

        racine.addEventListener('mouseenter', arreter);
        racine.addEventListener('mouseleave', demarrer);
        racine.addEventListener('focusin', arreter);
        racine.addEventListener('focusout', demarrer);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) arreter(); else demarrer();
        });

        afficher(0);
        demarrer();
    }

    /* ---------- 4. Filtre rapide par tranche d'âge ---------- */
    function initFiltreCours() {
        const conteneur = document.querySelector('[data-filtre-groupe]');
        if (!conteneur) return;

        const boutons = Array.from(conteneur.querySelectorAll('[data-filtre]'));
        const lignes = Array.from(conteneur.querySelectorAll('.cours-ligne'));
        const statut = conteneur.querySelector('[data-filtre-statut]');

        function appliquer(categorie) {
            let visibles = 0;
            lignes.forEach((ligne) => {
                const ok = categorie === 'tous' || ligne.dataset.public === categorie;
                ligne.hidden = !ok;
                if (ok) visibles += 1;
            });

            boutons.forEach((btn) => {
                btn.setAttribute('aria-pressed', String(btn.dataset.filtre === categorie));
            });

            if (statut) {
                statut.textContent = `${visibles} créneau${visibles > 1 ? 'x' : ''} affiché${visibles > 1 ? 's' : ''}`;
            }
        }

        boutons.forEach((btn) => {
            btn.addEventListener('click', () => appliquer(btn.dataset.filtre));
        });
    }

    /* ---------- 5. Copie en un clic (Contact) ---------- */
    function initCopie() {
        document.querySelectorAll('[data-copier]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const valeur = btn.dataset.copier;
                const msg = btn.parentElement ? btn.parentElement.querySelector('.copie-msg') : null;
                try {
                    await navigator.clipboard.writeText(valeur);
                } catch {
                    const champ = document.createElement('textarea');
                    champ.value = valeur;
                    champ.style.position = 'fixed';
                    champ.style.opacity = '0';
                    document.body.appendChild(champ);
                    champ.select();
                    document.execCommand('copy');
                    champ.remove();
                }
                if (msg) {
                    msg.textContent = 'Copié';
                    window.setTimeout(() => { msg.textContent = ''; }, 2200);
                }
            });
        });
    }

    /* ---------- 6. Consentement cookies & Google Forms ---------- */
    function initCookies() {
        const bandeau = document.getElementById('bandeau-cookies');
        const modale = document.getElementById('modale-cookies');
        const zones = Array.from(document.querySelectorAll('.form-zone'));
        const timers = new WeakMap();
        let declencheur = null;

        zones.forEach((zone) => {
            const texte = zone.querySelector('.form-repli__texte');
            if (texte && !texte.dataset.origine) {
                texte.dataset.origine = texte.innerHTML;
            }
        });

        function lireChoix() {
            try { return localStorage.getItem(CLE_COOKIES); } catch { return null; }
        }

        function ecrireChoix(valeur) {
            try {
                if (valeur === null) localStorage.removeItem(CLE_COOKIES);
                else localStorage.setItem(CLE_COOKIES, valeur);
            } catch { /* navigation privée */ }
        }

        function annulerTimer(zone) {
            const id = timers.get(zone);
            if (id) {
                window.clearTimeout(id);
                timers.delete(zone);
            }
        }

        function restaurerRepli(zone) {
            const repli = zone.querySelector('.form-repli');
            const texte = repli ? repli.querySelector('.form-repli__texte') : null;
            if (texte && texte.dataset.origine) texte.innerHTML = texte.dataset.origine;
            if (repli) repli.hidden = false;
        }

        function afficherFormulaires() {
            zones.forEach((zone) => {
                if (zone.querySelector('.form-iframe')) return;
                const url = zone.dataset.formUrl;
                if (!url) return;

                const repli = zone.querySelector('.form-repli');
                const texteRepli = repli ? repli.querySelector('.form-repli__texte') : null;
                if (repli) repli.hidden = true;

                const statut = document.createElement('p');
                statut.className = 'form-zone__statut';
                statut.setAttribute('role', 'status');
                statut.textContent = 'Chargement du formulaire Google Forms…';
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
                    if (repli) repli.hidden = true;
                });

                const id = window.setTimeout(() => {
                    if (charge) return;
                    statut.remove();
                    if (texteRepli) {
                        texteRepli.textContent =
                            "Le formulaire tarde à répondre ou votre navigateur le bloque. Vous pouvez vous préinscrire directement via l'une des options ci-dessous :";
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
                zone.querySelectorAll('.form-iframe, .form-zone__statut').forEach((el) => el.remove());
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
            const btnAccepter = bandeau.querySelector('.js-cookies-accepter');
            const btnRefuser = bandeau.querySelector('.js-cookies-refuser');

            if (btnAccepter) {
                btnAccepter.addEventListener('click', () => {
                    ecrireChoix('accepte');
                    appliquer('accepte');
                    fermerBandeau();
                });
            }
            if (btnRefuser) {
                btnRefuser.addEventListener('click', () => {
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
            const btnContinuer = modale.querySelector('.js-modale-continuer');
            const btnAccepter = modale.querySelector('.js-modale-accepter');
            if (btnContinuer) btnContinuer.addEventListener('click', fermerModale);
            if (btnAccepter) {
                btnAccepter.addEventListener('click', () => {
                    ecrireChoix('accepte');
                    appliquer('accepte');
                    fermerModale();
                });
            }
        }

        document.querySelectorAll('.js-cookies-rouvrir').forEach((btn) => {
            btn.addEventListener('click', () => ouvrirBandeau(btn));
        });

        window.theatre17ResetCookies = () => {
            ecrireChoix(null);
            retirerFormulaires();
            ouvrirBandeau(null);
        };
    }
})();

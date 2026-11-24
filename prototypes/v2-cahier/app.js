/**
 * Théâtre 17 — Piste 02 : Cahier de Texte
 * JS discret au service de la lecture : visionneuse à pellicule sans autoplay,
 * en-tête subtil au scroll, déplier/replier les mentions, cookies propres.
 */
(() => {
    'use strict';

    const CLE_COOKIES = 'theatre17-proto-cookies';
    const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

    document.addEventListener('DOMContentLoaded', () => {
        initHeaderScroll();
        initMenuMobile();
        initAncresAccessibles();
        initVisionneusePellicule();
        initAccordionsMentions();
        initCopie();
        initCookies();
    });

    /* ---------- 1. Bordure douce de l'en-tête au défilement ---------- */
    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        function verifier() {
            header.classList.toggle('est-defile', window.scrollY > 12);
        }

        verifier();
        window.addEventListener('scroll', verifier, { passive: true });
    }

    /* ---------- 2. Menu mobile ---------- */
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
            toggle.textContent = ouvert ? 'Fermer' : 'Menu';
        }

        toggle.addEventListener('click', () => setOuvert(!menu.classList.contains('is-open')));
        menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOuvert(false)));

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

    /* ---------- 3. Skip-link & ancres accessibles ---------- */
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

    /* ---------- 4. Visionneuse éditoriale à pellicule (sans autoplay) ---------- */
    function initVisionneusePellicule() {
        const bloc = document.querySelector('[data-scene]');
        if (!bloc) return;

        const cadre = bloc.querySelector('.scene-cadre');
        const imgPrincipale = bloc.querySelector('[data-scene-img]');
        const numEl = bloc.querySelector('[data-scene-num]');
        const titreEl = bloc.querySelector('[data-scene-titre]');
        const texteEl = bloc.querySelector('[data-scene-texte]');
        const vignettes = Array.from(bloc.querySelectorAll('.vignette'));

        let index = 0;
        let departX = null;

        function choisir(i) {
            index = (i + vignettes.length) % vignettes.length;
            const v = vignettes[index];

            if (imgPrincipale) {
                imgPrincipale.style.opacity = '0.25';
                window.setTimeout(() => {
                    imgPrincipale.src = v.dataset.src;
                    imgPrincipale.alt = v.dataset.alt || '';
                    imgPrincipale.style.opacity = '1';
                }, REDUCED_MOTION.matches ? 0 : 120);
            }

            if (numEl) numEl.textContent = `Tableau ${index + 1} sur ${vignettes.length}`;
            if (titreEl) titreEl.textContent = v.dataset.titre || '';
            if (texteEl) texteEl.textContent = v.dataset.texte || '';

            vignettes.forEach((btn, idx) => {
                const actif = idx === index;
                btn.classList.toggle('is-active', actif);
                btn.setAttribute('aria-pressed', String(actif));
            });
        }

        vignettes.forEach((btn, idx) => {
            btn.addEventListener('click', () => choisir(idx));
        });

        bloc.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); choisir(index + 1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); choisir(index - 1); }
        });

        if (cadre) {
            cadre.addEventListener('pointerdown', (e) => { departX = e.clientX; });
            cadre.addEventListener('pointerup', (e) => {
                if (departX === null) return;
                const delta = e.clientX - departX;
                departX = null;
                if (Math.abs(delta) > 40) choisir(delta < 0 ? index + 1 : index - 1);
            });
            cadre.addEventListener('pointercancel', () => { departX = null; });
        }
    }

    /* ---------- 5. Tout déplier / replier (mentions légales) ---------- */
    function initAccordionsMentions() {
        const bouton = document.querySelector('[data-toggle-mentions]');
        const pile = document.querySelector('.mentions-pile');
        if (!bouton || !pile) return;

        const items = Array.from(pile.querySelectorAll('details'));

        function majLibelle() {
            const toutOuvert = items.every((d) => d.open);
            bouton.textContent = toutOuvert ? 'Tout replier' : 'Tout déplier';
        }

        bouton.addEventListener('click', () => {
            const toutOuvert = items.every((d) => d.open);
            items.forEach((d) => { d.open = !toutOuvert; });
            majLibelle();
        });

        items.forEach((d) => d.addEventListener('toggle', majLibelle));
        majLibelle();
    }

    /* ---------- 6. Copie coordonnée ---------- */
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

    /* ---------- 7. Consentement cookies & Google Forms ---------- */
    function initCookies() {
        const bandeau = document.getElementById('bandeau-cookies');
        const modale = document.getElementById('modale-cookies');
        const zones = Array.from(document.querySelectorAll('.form-zone'));
        const timers = new WeakMap();
        let declencheur = null;

        zones.forEach((zone) => {
            const texte = zone.querySelector('.form-repli__texte');
            if (texte && !texte.dataset.origine) texte.dataset.origine = texte.innerHTML;
        });

        function lireChoix() {
            try { return localStorage.getItem(CLE_COOKIES); } catch { return null; }
        }

        function ecrireChoix(val) {
            try {
                if (val === null) localStorage.removeItem(CLE_COOKIES);
                else localStorage.setItem(CLE_COOKIES, val);
            } catch { /* sans effet */ }
        }

        function annulerTimer(zone) {
            const id = timers.get(zone);
            if (id) { window.clearTimeout(id); timers.delete(zone); }
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
                statut.textContent = 'Chargement du formulaire…';
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
                            "Le formulaire tarde à s'afficher ou est bloqué par votre navigateur. Vous pouvez vous inscrire via les options ci-dessous :";
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

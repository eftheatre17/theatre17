/**
 * Barre discrète de comparaison entre les 3 maquettes expérimentales.
 * Isolée en Shadow DOM pour n'interférer avec aucun style ni script des prototypes.
 */
(() => {
    'use strict';

    const VERSIONS = [
        { id: 'v1-affiche', label: '01 · Affiche de Saison' },
        { id: 'v2-cahier',  label: '02 · Cahier de Texte' },
        { id: 'v3-plateau', label: '03 · Plateau & Coulisses' },
    ];

    const script = document.currentScript;
    const activeVersion = script ? script.dataset.version : '';
    const currentPage = script ? (script.dataset.page || 'index.html') : 'index.html';

    const host = document.createElement('div');
    host.id = 'proto-bar-host';
    const shadow = host.attachShadow({ mode: 'open' });

    const liens = VERSIONS.map((v) => {
        const actif = v.id === activeVersion;
        const href = `../${v.id}/${currentPage}`;
        return `<a href="${href}" class="pb-link${actif ? ' is-active' : ''}"${actif ? ' aria-current="page"' : ''}>${v.label}</a>`;
    }).join('');

    shadow.innerHTML = `
        <style>
            :host {
                display: block;
                position: relative;
                z-index: 99999;
                font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
            }
            .pb {
                background: #111214;
                color: #e6e4de;
                border-bottom: 1px solid rgba(255, 255, 255, 0.14);
                font-size: 13px;
                line-height: 1.4;
            }
            .pb-inner {
                max-width: 1280px;
                margin: 0 auto;
                padding: 7px 16px;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 8px 16px;
            }
            .pb-group {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 6px;
            }
            .pb-tag {
                font-size: 11px;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #9e9b93;
                margin-right: 4px;
            }
            .pb-link,
            .pb-btn {
                appearance: none;
                background: transparent;
                color: #d6d3cb;
                border: 1px solid rgba(255, 255, 255, 0.16);
                border-radius: 4px;
                padding: 4px 10px;
                font: inherit;
                font-size: 12.5px;
                text-decoration: none;
                cursor: pointer;
                transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
            }
            .pb-link:hover,
            .pb-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
                border-color: rgba(255, 255, 255, 0.32);
            }
            .pb-link.is-active {
                background: #f5f2eb;
                color: #111214;
                border-color: #f5f2eb;
                font-weight: 600;
            }
            .pb-link:focus-visible,
            .pb-btn:focus-visible {
                outline: 2px solid #f0b35a;
                outline-offset: 2px;
            }
            .pb-hub {
                border-style: dashed;
            }
            .pb.is-hidden {
                display: none;
            }
            .pb-reopen {
                position: fixed;
                bottom: 14px;
                right: 14px;
                background: #111214;
                color: #f5f2eb;
                border: 1px solid rgba(255, 255, 255, 0.25);
                border-radius: 999px;
                padding: 7px 13px;
                font: 600 12px/1 system-ui, sans-serif;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                display: none;
            }
            .pb-reopen.is-visible {
                display: inline-block;
            }
        </style>
        <div class="pb" role="region" aria-label="Sélecteur de maquettes">
            <div class="pb-inner">
                <div class="pb-group">
                    <span class="pb-tag">Labo</span>
                    <a href="../index.html" class="pb-link pb-hub">Comparateur</a>
                    ${liens}
                </div>
                <div class="pb-group">
                    <button type="button" class="pb-btn" data-action="cookies">Tester bandeau cookies</button>
                    <button type="button" class="pb-btn" data-action="hide" title="Masquer la barre de comparaison">Masquer ✕</button>
                </div>
            </div>
        </div>
        <button type="button" class="pb-reopen" data-action="show">Labo · Changer de style</button>
    `;

    const bar = shadow.querySelector('.pb');
    const reopen = shadow.querySelector('.pb-reopen');

    shadow.querySelector('[data-action="cookies"]').addEventListener('click', () => {
        if (typeof window.theatre17ResetCookies === 'function') {
            window.theatre17ResetCookies();
        }
    });

    shadow.querySelector('[data-action="hide"]').addEventListener('click', () => {
        bar.classList.add('is-hidden');
        reopen.classList.add('is-visible');
    });

    reopen.addEventListener('click', () => {
        bar.classList.remove('is-hidden');
        reopen.classList.remove('is-visible');
    });

    document.addEventListener('DOMContentLoaded', () => {
        document.body.prepend(host);
    });
})();

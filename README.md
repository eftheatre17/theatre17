# Théâtre 17 — Site web

Site d'Emmanuelle Foltête — cours de théâtre et d'éloquence autour de La Rochelle.
En ligne sur **[theatre17.fr](https://theatre17.fr)**.

## Deux sites cohabitent en ce moment

| Adresse | Contenu | Source |
|---|---|---|
| `theatre17.fr` | **Site en production**, inchangé | Fichiers HTML à la racine du dépôt |
| `theatre17.fr/beta/` | **Version d'essai** à valider | Dossier `beta/`, généré depuis `src/` |

⚠️ **Ne touche pas aux réglages GitHub Pages.** Ils doivent rester sur
**Source : « Deploy from a branch » → `main` → `/ (root)`**. Les deux sites sont
de simples dossiers du dépôt : Pages les sert tels quels, sans configuration.

La version d'essai porte une balise `noindex` et un bandeau visible : elle ne
sera jamais indexée par Google et ne fera pas concurrence au site en ligne.

## Développer en local

```bash
npm install        # une seule fois
npm start          # aperçu sur http://localhost:8080, rechargement automatique
npm run build      # construit dans _site/ (non versionné, pour tester)
npm run build:beta # construit dans beta/ — c'est CE dossier qu'il faut commiter
```

**Après chaque modification destinée à la version d'essai**, relancer
`npm run build:beta` puis commiter le dossier `beta/`, sinon le site en ligne
ne reflétera pas les changements.

## Le jour où la version d'essai remplacera le site actuel

1. Supprimer les fichiers V1 de la racine (`index.html`, `contact.html`,
   `dompierre.html`, `la-jarrie.html`, `eloquence.html`, `css/`, `js/`, `img/`)
   ainsi que le dossier `beta/`.
2. Décommenter le déclencheur `push:` dans `.github/workflows/deploy.yml`.
3. **Puis seulement** basculer GitHub Pages sur « GitHub Actions ».

Faire l'étape 3 sans les deux premières casserait le site.

## Structure

```
src/
├── _data/site.js            Coordonnées, menu, identité légale — source unique
├── _includes/
│   ├── layouts/base.njk     Gabarit commun : <head>, SEO, données structurées
│   ├── layouts/inscription.njk  Gabarit des 3 pages de préinscription
│   └── partials/            En-tête et pied de page, écrits une seule fois
├── index.njk                Accueil
├── dompierre.njk            \
├── la-jarrie.njk             > pages d'inscription (quelques lignes chacune)
├── eloquence.njk            /
├── contact.njk              Contact et mentions légales
├── sitemap.njk              Plan de site, généré automatiquement
├── css/  js/  fonts/  img/  social/  favicon/
└── CNAME  robots.txt
```

`_site/` est le résultat de la construction : il n'est ni versionné, ni à modifier.

## Modifier le site

| Pour changer… | Modifier… |
|---|---|
| Le menu, le téléphone, l'email, le SIRET | `src/_data/site.js` — se propage partout |
| L'en-tête ou le pied de page | `src/_includes/partials/` — une seule fois pour les 5 pages |
| Le lien d'un formulaire | Le champ `formUrl` en tête de la page concernée |
| Une image | Déposer le fichier dans `src/img/`, appeler `{% image %}` |

Les images sont converties automatiquement en AVIF, WebP et JPEG, en quatre
largeurs. **Ne jamais compresser une image à la main avant de la déposer** :
plus le fichier d'origine est grand, meilleur est le résultat.

## Choix techniques

- **Aucun service tiers au chargement.** Les polices sont hébergées ici même
  (`src/fonts/`). Les formulaires Google ne se chargent qu'après un clic
  explicite du visiteur — voir les mentions légales.
- **Adresses de pages inchangées** (`/dompierre.html`, etc.) afin de ne pas
  perdre le référencement acquis.
- **Eleventy plutôt qu'Astro** : Astro 5 exige Node 18.20.8 ou plus récent,
  la machine de développement est en 18.19.1.

## Documents de travail

Ils sont volontairement placés **hors de ce dépôt** (dossier parent), car tout
ce qui est ici est publié sur Internet : `RAPPORT-V2.md` (audit), `SPEC-V2.md`
(cahier des charges de la refonte), `REPRISE-PROJET.md`.

---

© Théâtre 17 — Tous droits réservés.

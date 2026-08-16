# Théâtre 17

Site de **Emmanuelle Foltête**, professeure de théâtre et d'éloquence en
Charente-Maritime — Dompierre-sur-Mer, La Jarrie et La Rochelle.

En ligne : **[theatre17.fr](https://theatre17.fr)**

## Comment ça marche

Le site est **généré** par [Eleventy](https://www.11ty.dev/) à partir des
sources du dossier `src/`. Il n'y a pas de HTML à modifier page par page :
l'en-tête, le pied de page et le menu sont écrits une seule fois.

```
src/
├── _data/
│   ├── site.js            # menu, coordonnées, identité légale — source unique
│   └── redirections.js    # anciennes adresses .html à ne pas casser
├── _includes/
│   ├── layouts/           # base.njk (toutes les pages), inscription.njk
│   └── partials/          # en-tête, pied de page, bandeau et modale cookies
├── index.njk              # accueil
├── dompierre.njk          # préinscription Dompierre-sur-Mer
├── la-jarrie.njk          # préinscription La Jarrie
├── eloquence.njk          # préinscription cours d'éloquence
├── contact.njk            # contact et mentions légales
├── 404.njk                # page d'erreur
├── redirections.njk       # génère les pages de renvoi des anciennes adresses
├── sitemap.njk            # génère sitemap.xml
├── css/ js/ fonts/ img/   # ressources
└── social/                # image de partage
```

## Développer

Node.js 18 ou plus récent.

```bash
npm install
npm start          # aperçu local avec rechargement automatique
npm run build      # construit le site dans _site/
```

`_site/` n'est pas versionné : il est reconstruit à chaque publication.

## Publication

Chaque `push` sur `main` déclenche le workflow
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), qui construit
le site et le publie sur GitHub Pages.

> Le réglage **Settings → Pages → Source** du dépôt doit être sur
> **GitHub Actions**. S'il repasse sur « Deploy from a branch », le workflow
> construit dans le vide et le site reste figé sur la dernière publication.

## Quelques partis pris

**Aucun traceur.** Pas de publicité, pas de mesure d'audience. Les polices
sont hébergées ici même, donc aucune requête ne part vers Google au
chargement d'une page.

**Les formulaires d'inscription sont des Google Forms**, et Google y dépose
ses propres cookies. Le consentement est donc demandé dans un bandeau à
l'arrivée, où refuser est exactement aussi simple qu'accepter, et le choix
reste modifiable depuis le pied de page. Tant qu'il n'a pas été accepté,
aucune requête ne part vers Google.

**Adresses sans extension.** Les pages sont servies en `/dompierre/` plutôt
qu'en `/dompierre.html`. Les anciennes adresses restent valides : elles
renvoient vers les nouvelles et leur transmettent leur référencement.

**Images optimisées à la construction** en AVIF, WebP et JPEG, en quatre
largeurs, par `@11ty/eleventy-img`.

## Contact

Emmanuelle Foltête — <eftheatre17@gmail.com>

---

© 2026 Théâtre 17. Tous droits réservés.

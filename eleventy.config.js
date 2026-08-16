const Image = require("@11ty/eleventy-img");
const path = require("path");

// Construction de la version d'essai, publiee dans un sous-dossier
// (theatre17.fr/beta/) a cote du site classique, qui reste intact.
const BETA = process.env.BETA === "1";

/**
 * Raccourci {% image %} : convertit une image source en AVIF + WebP + JPEG,
 * dans plusieurs largeurs, et renvoie une balise <picture> complete avec
 * srcset, dimensions et chargement differe.
 *
 * Les PNG d'origine (2,7 Mo au total) restent dans src/ et ne sont jamais
 * publies : seules les versions optimisees partent en production.
 */
async function imageShortcode(src, alt, sizes = "100vw", classes = "", eager = false) {
  if (alt === undefined) {
    throw new Error(`Texte alternatif manquant pour l'image : ${src}`);
  }

  const metadata = await Image(src, {
    widths: [400, 800, 1200, 1600],
    formats: ["avif", "webp", "jpeg"],
    // Les images optimisees doivent atterrir dans le meme dossier de
    // sortie que le reste du site (_site en temps normal, beta/ pour la
    // version d'essai). L'adresse, elle, reste absolue : le greffon
    // HtmlBasePlugin y ajoute le prefixe voulu.
    outputDir: BETA ? "./beta/img/" : "./_site/img/",
    urlPath: "/img/",
    filenameFormat: (id, src, width, format) => {
      const name = path.basename(src, path.extname(src));
      return `${name}-${width}w.${format}`;
    },
  });

  return Image.generateHTML(metadata, {
    alt,
    sizes,
    class: classes,
    loading: eager ? "eager" : "lazy",
    decoding: "async",
    fetchpriority: eager ? "high" : "auto",
  });
}

// Configuration asynchrone : Eleventy 3 n'expose ses greffons qu'en
// modules ES, que Node 18 ne sait pas charger via require().
module.exports = async function (eleventyConfig) {
  const { HtmlBasePlugin } = await import("@11ty/eleventy");

  // Fichiers copies tels quels
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/fonts": "fonts" });
  eleventyConfig.addPassthroughCopy({ "src/favicon": "favicon" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/social": "social" });
  // Ni CNAME ni robots.txt dans la version d'essai : seuls ceux placés
  // à la racine du domaine font autorité, et en dupliquer prêterait à
  // confusion.
  if (!BETA) {
    eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
    eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  }

  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  // Reecrit toutes les adresses absolues (/css/, /img/, /fonts/…) en
  // fonction du sous-dossier de publication. Sans cela, la version
  // d'essai chercherait ses fichiers a la racine du domaine, donc dans
  // le site classique.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // La version d'essai ne doit jamais etre indexee : elle ferait
  // doublon avec le vrai site et lui ferait concurrence dans Google.
  eleventyConfig.addGlobalData("beta", BETA);

  // Date ISO pour le plan de site
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());

  // Libellé court d'une page, tel qu'il figure dans le menu. Sert au fil
  // d'Ariane : le titre complet des pages est écrit pour le référencement
  // et serait illisible dans un chemin de navigation.
  // Renvoie null pour l'accueil et pour toute page absente du menu, ce qui
  // supprime alors le fil d'Ariane.
  eleventyConfig.addFilter("libelleNav", (url, nav) => {
    if (url === "/") return null;
    const entree = nav.find((lien) => lien.url === url);
    return entree ? entree.texte : null;
  });

  // Annee courante : plus de "2026" ecrit en dur dans les pieds de page
  eleventyConfig.addGlobalData("annee", () => new Date().getFullYear());

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};

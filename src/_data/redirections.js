/**
 * Anciennes adresses du site, conservées après le passage aux URL sans
 * extension.
 *
 * Ces adresses en .html sont celles que Google a indexées, celles qui
 * figurent sur la fiche Google Business et celles que les familles ont pu
 * mettre en favori. Les supprimer purement et simplement enverrait tout ce
 * monde sur une page d'erreur et ferait perdre le référencement acquis.
 *
 * GitHub Pages sert des fichiers statiques : il ne sait pas répondre par une
 * redirection 301, qui serait la solution idéale. On génère donc à la place
 * une page de renvoi par ancienne adresse (voir redirections.njk).
 */
module.exports = [
  { ancienne: "/dompierre.html", nouvelle: "/dompierre/" },
  { ancienne: "/la-jarrie.html", nouvelle: "/la-jarrie/" },
  { ancienne: "/eloquence.html", nouvelle: "/eloquence/" },
  { ancienne: "/contact.html", nouvelle: "/contact/" },
];

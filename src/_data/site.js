/**
 * Donnees globales du site.
 *
 * Tout ce qui se repete d'une page a l'autre est centralise ici :
 * le menu, les coordonnees, l'identite legale. Une seule modification
 * ici se propage a l'ensemble des pages, au menu, au pied de page et
 * aux donnees structurees lues par Google.
 */
module.exports = {
  nom: "Théâtre 17",
  professeure: "Emmanuelle Foltête",
  url: "https://theatre17.fr",
  langue: "fr",

  // Menu principal, unique source de verite
  nav: [
    { texte: "Accueil", url: "/" },
    { texte: "Dompierre", url: "/dompierre/" },
    { texte: "La Jarrie", url: "/la-jarrie/" },
    { texte: "Cours d'éloquence", url: "/eloquence/" },
    { texte: "Contact", url: "/contact/" },
  ],

  contact: {
    // Numero au format international, sans espaces : c'est ce que
    // composent les telephones quand on clique sur le lien.
    telephoneLien: "+33660711186",
    telephoneAffiche: "+33 (0)6 60 71 11 86",
    email: "eftheatre17@gmail.com",
  },

  // Identite legale. Adresse confirmee exacte par le client.
  legal: {
    siret: "52107895600039",
    adresse: "17-19 rue de l'Atlas",
    codePostal: "75019",
    ville: "Paris",
    pays: "FR",
    directeurPublication: "Emmanuelle Foltête",
    derniereMiseAJour: "16 août 2026",
  },

  // Communes ou les cours ont lieu. Sert au referencement local.
  // A completer avec les adresses exactes des salles quand elles
  // seront connues (voir SPEC-V2.md, partie 4).
  zonesDesservies: [
    "Dompierre-sur-Mer",
    "La Jarrie",
    "La Rochelle",
    "Charente-Maritime",
  ],

  // Image affichee lors d'un partage sur les reseaux sociaux
  ogImage: "/social/og-image.jpg",
};

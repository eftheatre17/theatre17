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
  // Le type distingue une commune d'un departement : les deux sont des
  // zones desservies, mais Google ne les interprete pas de la meme facon.
  zonesDesservies: [
    { nom: "Dompierre-sur-Mer", type: "City" },
    { nom: "La Jarrie", type: "City" },
    { nom: "La Rochelle", type: "City" },
    { nom: "Charente-Maritime", type: "AdministrativeArea" },
  ],

  // Salles ou les cours ont effectivement lieu.
  //
  // Elles sont decrites ici une seule fois et publiees dans le bloc
  // LocalBusiness, present sur toutes les pages. Les pages de cours s'y
  // referent ensuite par leur identifiant plutot que de les redecrire :
  // une adresse decrite a deux endroits finit toujours par diverger.
  //
  // C'est aussi ce qui rattache l'activite a des adresses reelles en
  // Charente-Maritime, la ou l'adresse legale de l'entreprise est a Paris.
  lieux: [
    {
      id: "foyer-ferdinand-rieux",
      nom: "Foyer Ferdinand Rieux",
      rue: "Rue de la Belle Aurore",
      codePostal: "17139",
      ville: "Dompierre-sur-Mer",
    },
    {
      id: "salle-des-fetes-la-jarrie",
      nom: "Salle des fêtes de La Jarrie",
      rue: "Rue de la Mairie",
      codePostal: "17220",
      ville: "La Jarrie",
    },
    {
      id: "salle-du-tilleul",
      nom: "Salle du Tilleul, Chagnolet",
      rue: "42B Grande Rue",
      codePostal: "17139",
      ville: "Dompierre-sur-Mer",
    },
  ],

  // Image affichee lors d'un partage sur les reseaux sociaux
  ogImage: "/social/og-image.jpg",
};

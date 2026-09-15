/**
 * Validation et normalisation d'un voyage côté serveur.
 *
 * Les attributs required/min/maxlength du formulaire ne sont qu'une aide pour
 * l'utilisateur : ces règles-ci sont les seules qui font foi, un client pouvant
 * toujours envoyer autre chose que ce que propose la page.
 *
 * La fonction ne recopie que les champs connus (pas d'affectation massive) et
 * renvoie la liste des erreurs en français, prête à être affichée.
 */
const LONGUEURS = {
  destination: 80,
  pays: 60,
  devise: 8,
  image: 500,
  titre: 120,
  description: 2000,
};

const DEVISES = ['€', '$', '£', 'CHF', 'CAD'];
const PRIX_MAX = 1000000;

function texte(valeur) {
  return typeof valeur === 'string' ? valeur.trim() : '';
}

function validerVoyage(corps) {
  const erreurs = [];
  const voyage = {};

  // Destination et pays : obligatoires, longueur bornée
  voyage.destination = texte(corps.destination);
  if (voyage.destination === '') {
    erreurs.push('La destination est obligatoire.');
  } else if (voyage.destination.length > LONGUEURS.destination) {
    erreurs.push('La destination ne doit pas dépasser ' + LONGUEURS.destination + ' caractères.');
  }

  voyage.pays = texte(corps.pays);
  if (voyage.pays === '') {
    erreurs.push('Le pays est obligatoire.');
  } else if (voyage.pays.length > LONGUEURS.pays) {
    erreurs.push('Le pays ne doit pas dépasser ' + LONGUEURS.pays + ' caractères.');
  }

  // Prix : obligatoire, nombre positif, borné et arrondi au centime
  const prixSaisi = texte(corps.prix);
  const prix = Number(prixSaisi.replace(',', '.'));
  if (prixSaisi === '') {
    erreurs.push('Le prix est obligatoire.');
  } else if (!Number.isFinite(prix)) {
    erreurs.push('Le prix doit être un nombre.');
  } else if (prix < 0 || prix > PRIX_MAX) {
    erreurs.push('Le prix doit être compris entre 0 et ' + PRIX_MAX + '.');
  } else {
    voyage.prix = Math.round(prix * 100) / 100;
  }

  // Devise : facultative (€ par défaut), limitée aux devises connues
  voyage.devise = texte(corps.devise) || '€';
  if (DEVISES.indexOf(voyage.devise) === -1) {
    erreurs.push("La devise doit être l'une des suivantes : " + DEVISES.join(', ') + '.');
  }

  // Image : facultative, adresse http(s) ou chemin local uniquement
  voyage.image = texte(corps.image);
  if (voyage.image !== '' && !/^(https?:\/\/|\/)/i.test(voyage.image)) {
    erreurs.push("L'image doit être une adresse http(s) ou un chemin commençant par /.");
  } else if (voyage.image.length > LONGUEURS.image) {
    erreurs.push("L'adresse de l'image ne doit pas dépasser " + LONGUEURS.image + ' caractères.');
  }

  // Titre et description : facultatifs, longueur bornée
  voyage.titre = texte(corps.titre);
  if (voyage.titre.length > LONGUEURS.titre) {
    erreurs.push('Le titre ne doit pas dépasser ' + LONGUEURS.titre + ' caractères.');
  }

  voyage.description = texte(corps.description);
  if (voyage.description.length > LONGUEURS.description) {
    erreurs.push('La description ne doit pas dépasser ' + LONGUEURS.description + ' caractères.');
  }

  return { erreurs: erreurs, voyage: voyage };
}

module.exports = {
  validerVoyage: validerVoyage,
  LONGUEURS: LONGUEURS,
  DEVISES: DEVISES,
  PRIX_MAX: PRIX_MAX,
};

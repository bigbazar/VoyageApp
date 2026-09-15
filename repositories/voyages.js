/**
 * Accès aux données des voyages.
 *
 * Les voyages sont conservés dans un fichier JSON, dont le chemin se règle par
 * la variable d'environnement VOYAGES_DATA_FILE (par défaut data/voyages.json).
 * Chaque écriture passe par un fichier temporaire renommé ensuite : le fichier
 * de données n'est jamais laissé à moitié écrit.
 *
 * Les entrées/sorties sont volontairement synchrones : le fichier est petit et
 * lu une seule fois. Si le volume grossissait, c'est le seul module à remplacer
 * (par SQLite par exemple) : les routes, les contrôleurs et les vues n'ont pas
 * connaissance du stockage.
 */
const fs = require('fs');
const path = require('path');
const voyagesInitiaux = require('../models/BaseVoyages.js');

const CHEMIN = process.env.VOYAGES_DATA_FILE
  ? path.resolve(process.env.VOYAGES_DATA_FILE)
  : path.join(__dirname, '..', 'data', 'voyages.json');

let voyages = null;

/** Tri alphabétique français, insensible aux accents. */
function comparerParDestination(a, b) {
  return a.destination.localeCompare(b.destination, 'fr');
}

function ecrire() {
  const temporaire = CHEMIN + '.tmp';
  fs.mkdirSync(path.dirname(CHEMIN), { recursive: true });
  fs.writeFileSync(temporaire, JSON.stringify(voyages, null, 2) + '\n');
  fs.renameSync(temporaire, CHEMIN);
}

/** Charge le fichier au premier accès ; le crée à partir du jeu initial sinon. */
function charger() {
  if (voyages) return voyages;

  try {
    const contenu = JSON.parse(fs.readFileSync(CHEMIN, 'utf8'));
    if (!Array.isArray(contenu)) throw new Error('le fichier ne contient pas une liste');
    voyages = contenu;
  } catch {
    // Fichier absent, illisible ou corrompu : on repart du jeu de données initial
    voyages = voyagesInitiaux.map((voyage) => Object.assign({}, voyage));
    ecrire();
  }

  return voyages;
}

/**
 * Liste les voyages triés par destination.
 * Une recherche filtre sur la destination, le pays, ou un prix maximum.
 */
function lister(options) {
  const recherche = String((options && options.recherche) || '')
    .trim()
    .toLowerCase();
  const prixMax = parseInt(recherche, 10);

  return charger()
    .filter((voyage) => {
      if (recherche === '') return true;
      return (
        voyage.destination.toLowerCase().includes(recherche) ||
        voyage.pays.toLowerCase().includes(recherche) ||
        (!isNaN(prixMax) && voyage.prix <= prixMax)
      );
    })
    .slice()
    .sort(comparerParDestination);
}

function trouver(id) {
  return charger().find((voyage) => voyage.id === Number(id)) || null;
}

/** Ajoute un voyage en lui attribuant le premier identifiant libre. */
function creer(donnees) {
  const tous = charger();
  const identifiant = tous.reduce((maximum, voyage) => Math.max(maximum, voyage.id), 0) + 1;
  const voyage = Object.assign({}, donnees, { id: identifiant });

  tous.push(voyage);
  ecrire();
  return voyage;
}

/** Remplace le voyage existant ; renvoie null s'il n'existe pas. */
function modifier(id, donnees) {
  const tous = charger();
  const index = tous.findIndex((voyage) => voyage.id === Number(id));
  if (index === -1) return null;

  tous[index] = Object.assign({}, donnees, { id: Number(id) });
  ecrire();
  return tous[index];
}

/** Renvoie false si le voyage n'existait pas. */
function supprimer(id) {
  const tous = charger();
  const restants = tous.filter((voyage) => voyage.id !== Number(id));
  if (restants.length === tous.length) return false;

  voyages = restants;
  ecrire();
  return true;
}

module.exports = {
  CHEMIN: CHEMIN,
  lister: lister,
  trouver: trouver,
  creer: creer,
  modifier: modifier,
  supprimer: supprimer,
};

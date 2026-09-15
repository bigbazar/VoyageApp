/**
 * Outils partagés par les tests.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');

// Les tests écrivent leurs données dans un dossier temporaire, jamais dans le
// fichier de l'application.
const DOSSIER_TEMPORAIRE = fs.mkdtempSync(path.join(os.tmpdir(), 'voyageapp-tests-'));
let compteur = 0;

process.on('exit', () => {
  fs.rmSync(DOSSIER_TEMPORAIRE, { recursive: true, force: true });
});

/** Chemin d'un fichier de données temporaire, unique pour un test. */
function fichierTemporaire(nom) {
  compteur += 1;
  return path.join(DOSSIER_TEMPORAIRE, (nom || 'voyages') + '-' + compteur + '.json');
}

/**
 * Retourne une application neuve, avec son propre fichier de données.
 * Les modules sont rechargés à chaque appel pour que les tests soient indépendants.
 */
function creerApp(environnement) {
  jest.resetModules();
  process.env.NODE_ENV = environnement || 'test';
  process.env.VOYAGES_DATA_FILE = fichierTemporaire();
  return require('../app');
}

/** Retourne une instance neuve du dépôt, branchée sur le fichier indiqué. */
function creerDepot(chemin) {
  jest.resetModules();
  process.env.VOYAGES_DATA_FILE = chemin || fichierTemporaire('depot');
  return require('../repositories/voyages.js');
}

/** Décode les entités HTML, comme le fait le navigateur avant de lire un attribut. */
function decoder(texte) {
  return texte
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Relit les données de chaque carte comme le fait le navigateur via dataset.voyage. */
function voyagesDeLaPage(html) {
  return [...html.matchAll(/data-voyage="([^"]*)"/g)].map((resultat) =>
    JSON.parse(decoder(resultat[1])),
  );
}

function voyageDeLaPage(html, id) {
  return voyagesDeLaPage(html).find((voyage) => voyage.id === id);
}

/** Récupère un jeton CSRF dans le formulaire de la page d'accueil. */
async function jetonCsrf(app) {
  const page = await request(app).get('/');
  const jeton = page.text.match(/name="_csrf" value="([^"]+)"/);
  if (!jeton) throw new Error('aucun jeton CSRF dans la page');
  return jeton[1];
}

module.exports = {
  DOSSIER_TEMPORAIRE,
  fichierTemporaire,
  creerApp,
  creerDepot,
  decoder,
  voyagesDeLaPage,
  voyageDeLaPage,
  jetonCsrf,
};

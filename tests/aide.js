/**
 * Outils partagés par les tests.
 */
const request = require('supertest');

/**
 * Les voyages sont stockés en mémoire dans routes/index.js : on repart d'un
 * module neuf à chaque test pour qu'ils restent indépendants les uns des autres.
 */
function creerApp(environnement) {
  jest.resetModules();
  process.env.NODE_ENV = environnement || 'test';
  return require('../app');
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

module.exports = { creerApp, decoder, voyagesDeLaPage, voyageDeLaPage, jetonCsrf };

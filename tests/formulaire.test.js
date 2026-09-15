/**
 * Bug 2 : le bouton « modifier » ne fonctionnait pas sur les voyages dont la
 * description contient une apostrophe, à cause du passage des données dans un
 * attribut onclick.
 */
const request = require('supertest');
const { creerApp, voyagesDeLaPage, voyageDeLaPage } = require('./aide');

let app;

beforeEach(() => {
  app = creerApp('development');
});

describe('Données du formulaire d’édition', () => {
  test('les valeurs ne passent plus par un onclick avec des arguments', async () => {
    const res = await request(app).get('/');
    expect(res.text).not.toContain('onclick="editVoyage(\'');
    expect(res.text.match(/data-voyage="/g)).toHaveLength(8);
  });

  test('chaque carte expose les huit champs attendus', async () => {
    const res = await request(app).get('/');
    const attendus = [
      'description',
      'destination',
      'devise',
      'id',
      'image',
      'pays',
      'prix',
      'titre',
    ];

    voyagesDeLaPage(res.text).forEach((voyage) => {
      expect(Object.keys(voyage).sort()).toEqual(attendus);
    });
  });

  test('le JSON reste exploitable malgré l’apostrophe de la description', async () => {
    const res = await request(app).get('/');
    const voyage = voyageDeLaPage(res.text, 3);

    expect(voyage.destination).toBe('New-York');
    expect(voyage.description).toContain("d'Ellis Island");
  });

  test('les descriptions contenant une apostrophe sont présentes sur plusieurs cartes', async () => {
    const res = await request(app).get('/');
    const avecApostrophe = voyagesDeLaPage(res.text).filter((voyage) =>
      /['’]/.test(voyage.description),
    );

    expect(avecApostrophe.length).toBeGreaterThanOrEqual(4);
  });
});

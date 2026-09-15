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
    const res = await request(app).get('/voyages');
    expect(res.text).not.toContain('onclick="editVoyage(\'');
    expect(res.text.match(/data-voyage="/g)).toHaveLength(8);
  });

  test('chaque carte expose les huit champs attendus', async () => {
    const res = await request(app).get('/voyages');
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
    const res = await request(app).get('/voyages');
    const voyage = voyageDeLaPage(res.text, 3);

    expect(voyage.destination).toBe('New-York');
    expect(voyage.description).toContain("d'Ellis Island");
  });

  test('plusieurs cartes ont une description contenant une apostrophe', async () => {
    const res = await request(app).get('/voyages');
    const avecApostrophe = voyagesDeLaPage(res.text).filter((voyage) =>
      /['’]/.test(voyage.description),
    );

    expect(avecApostrophe.length).toBeGreaterThanOrEqual(4);
  });
});

describe('Câblage des formulaires', () => {
  test('le formulaire du modal crée sur POST /voyages', async () => {
    const res = await request(app).get('/voyages');

    expect(res.text).toContain('<form method="post" action="/voyages" id="formVoyage">');
    expect(res.text).toContain('name="_method" value="PUT"');
  });

  test('chaque carte envoie une suppression en DELETE', async () => {
    const res = await request(app).get('/voyages');

    expect(res.text.match(/name="_method" value="DELETE"/g)).toHaveLength(8);
    expect(res.text).toContain('action="/voyages/1"');
  });

  test('le jeton CSRF accompagne chaque formulaire qui modifie des données', async () => {
    const res = await request(app).get('/voyages');
    expect(res.text.match(/name="_csrf"/g)).toHaveLength(9);
  });

  test('la recherche utilise un GET vers /voyages', async () => {
    const res = await request(app).get('/voyages');

    expect(res.text).toContain('method="get" action="/voyages"');
    expect(res.text).not.toContain('action="/search"');
  });
});

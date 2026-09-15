/**
 * Bug 3 : la recherche renvoyait des doublons et plantait sur un champ vide.
 */
const request = require('supertest');
const { creerApp } = require('./aide');

let app;

const destinations = (html) =>
  [...html.matchAll(/<h5 class="m-1">([^<]*)<\/h5>/g)].map((resultat) => resultat[1]);

const cartes = (html) => html.match(/class="card col-2/g) || [];

beforeEach(() => {
  app = creerApp('development');
});

describe('Recherche de voyages', () => {
  test('un terme correspondant à plusieurs critères ne crée pas de doublon', async () => {
    // « Porto » et « Lisbonne » correspondent à la fois à la destination et au pays
    const res = await request(app)
      .post('/search')
      .type('form')
      .send({ searchVoyage: 'o' })
      .expect(200);

    const resultats = destinations(res.text);
    expect(resultats).toHaveLength(6);
    expect(new Set(resultats).size).toBe(6);
  });

  test('un champ vide renvoie toute la liste au lieu de planter', async () => {
    const res = await request(app)
      .post('/search')
      .type('form')
      .send({ searchVoyage: '' })
      .expect(200);
    expect(cartes(res.text)).toHaveLength(8);
  });

  test('un champ absent ne fait pas planter la recherche', async () => {
    const res = await request(app).post('/search').type('form').send({}).expect(200);
    expect(cartes(res.text)).toHaveLength(8);
  });

  test('la recherche par destination fonctionne', async () => {
    const res = await request(app)
      .post('/search')
      .type('form')
      .send({ searchVoyage: 'londres' })
      .expect(200);
    expect(destinations(res.text)).toEqual(['Londres']);
  });

  test('la recherche par pays fonctionne', async () => {
    const res = await request(app)
      .post('/search')
      .type('form')
      .send({ searchVoyage: 'Espagne' })
      .expect(200);
    expect(destinations(res.text).sort()).toEqual(['Barcelone', 'Séville']);
  });

  test('la recherche par prix maximum fonctionne', async () => {
    const res = await request(app)
      .post('/search')
      .type('form')
      .send({ searchVoyage: '100' })
      .expect(200);
    expect(cartes(res.text)).toHaveLength(2);
  });

  test('une recherche sans résultat renvoie 404', async () => {
    await request(app).post('/search').type('form').send({ searchVoyage: 'zzz' }).expect(404);
  });

  test('la recherche reste accessible sans jeton CSRF (simple lecture)', async () => {
    await request(app).post('/search').type('form').send({ searchVoyage: 'Rome' }).expect(200);
  });
});

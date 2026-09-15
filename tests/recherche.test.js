/**
 * Bug 3 : la recherche renvoyait des doublons et plantait sur un champ vide.
 * Étape 4 : la recherche est une lecture, donc un GET dont l'URL est partageable.
 */
const request = require('supertest');
const { creerApp } = require('./aide');

let app;

beforeEach(() => {
  app = creerApp('development');
});

const destinations = (html) =>
  [...html.matchAll(/<h5 class="m-1">([^<]*)<\/h5>/g)].map((resultat) => resultat[1]);
const cartes = (html) => html.match(/class="card col-2/g) || [];

describe('Recherche de voyages', () => {
  test('un terme correspondant à plusieurs critères ne crée pas de doublon', async () => {
    // « Porto » et « Lisbonne » correspondent à la fois à la destination et au pays
    const res = await request(app).get('/voyages').query({ q: 'o' }).expect(200);

    const resultats = destinations(res.text);
    expect(resultats).toHaveLength(6);
    expect(new Set(resultats).size).toBe(6);
  });

  test('une recherche vide renvoie toute la liste', async () => {
    const res = await request(app).get('/voyages').query({ q: '' }).expect(200);
    expect(cartes(res.text)).toHaveLength(8);
  });

  test('sans paramètre, la liste est complète', async () => {
    const res = await request(app).get('/voyages').expect(200);
    expect(cartes(res.text)).toHaveLength(8);
  });

  test('la recherche porte sur la destination', async () => {
    const res = await request(app).get('/voyages').query({ q: 'londres' }).expect(200);
    expect(destinations(res.text)).toEqual(['Londres']);
  });

  test('la recherche porte sur le pays', async () => {
    const res = await request(app).get('/voyages').query({ q: 'Espagne' }).expect(200);
    expect(destinations(res.text).sort()).toEqual(['Barcelone', 'Séville']);
  });

  test('la recherche porte sur un prix maximum', async () => {
    const res = await request(app).get('/voyages').query({ q: '100' }).expect(200);
    expect(cartes(res.text)).toHaveLength(2);
  });

  test('une recherche sans résultat affiche un état vide', async () => {
    const res = await request(app).get('/voyages').query({ q: 'zzz' }).expect(200);

    expect(cartes(res.text)).toHaveLength(0);
    expect(res.text).toContain('Aucun voyage ne correspond');
  });

  test('le terme recherché reste dans le champ', async () => {
    const res = await request(app).get('/voyages').query({ q: 'Rome' }).expect(200);
    expect(res.text).toContain('value="Rome"');
  });

  test('la recherche ne demande aucun jeton CSRF', async () => {
    await request(app).get('/voyages').query({ q: 'Rome' }).expect(200);
  });
});

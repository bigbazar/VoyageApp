/**
 * Point 2 de la feuille de route : en-têtes, protection CSRF, validation
 * serveur et documentation Swagger réservée au développement.
 */
const request = require('supertest');
const { creerApp, jetonCsrf, voyageDeLaPage } = require('./aide');

let app;
let jeton;

beforeEach(async () => {
  app = creerApp('development');
  jeton = await jetonCsrf(app);
});

describe('En-têtes de sécurité', () => {
  test('helmet ajoute les en-têtes attendus et masque X-Powered-By', async () => {
    const res = await request(app).get('/').expect(200);

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['content-security-policy']).toContain('https://cdn.jsdelivr.net');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('Protection CSRF', () => {
  test('une création sans jeton est refusée', async () => {
    await request(app)
      .post('/voyages')
      .type('form')
      .send({ destination: 'Pirate', pays: 'Test', prix: '1' })
      .expect(403);
  });

  test('une création avec un jeton falsifié est refusée', async () => {
    await request(app)
      .post('/voyages')
      .type('form')
      .send({
        _csrf: 'abc.1700000000000.deadbeef',
        destination: 'Pirate',
        pays: 'Test',
        prix: '1',
      })
      .expect(403);
  });

  test('une suppression sans jeton est refusée et ne modifie rien', async () => {
    await request(app).post('/voyages/1').type('form').send({ _method: 'DELETE' }).expect(403);
    await request(app).get('/voyages/1').expect(200);
  });

  test('une modification sans jeton est refusée', async () => {
    await request(app)
      .put('/voyages/1')
      .type('form')
      .send({ destination: 'Pirate', pays: 'Test', prix: '1' })
      .expect(403);
  });

  test('une création avec le jeton de la page est acceptée', async () => {
    await request(app)
      .post('/voyages')
      .type('form')
      .send({ _csrf: jeton, destination: 'Bergame', pays: 'Italie', prix: '120', devise: '€' })
      .expect(303);

    const res = await request(app).get('/voyages').expect(200);
    expect(res.text).toContain('Bergame');
  });

  test('chaque formulaire de la page porte un jeton', async () => {
    const res = await request(app).get('/');
    // une pour le formulaire d'ajout et une par carte
    expect(res.text.match(/name="_csrf"/g)).toHaveLength(9);
  });
});

describe('Validation serveur', () => {
  const envoyer = (champs) =>
    request(app)
      .post('/voyages')
      .type('form')
      .send(Object.assign({ _csrf: jeton }, champs));

  test.each([
    ['destination vide', { destination: '', pays: 'Italie', prix: '100' }],
    ['pays vide', { destination: 'Nice', pays: '', prix: '100' }],
    ['prix absent', { destination: 'Nice', pays: 'France', prix: '' }],
    ['prix négatif', { destination: 'Nice', pays: 'France', prix: '-5' }],
    ['prix non numérique', { destination: 'Nice', pays: 'France', prix: 'abc' }],
    ['prix trop élevé', { destination: 'Nice', pays: 'France', prix: '99999999' }],
    [
      'image en javascript:',
      { destination: 'Nice', pays: 'France', prix: '10', image: 'javascript:alert(1)' },
    ],
    ['devise inconnue', { destination: 'Nice', pays: 'France', prix: '10', devise: 'XXX' }],
    ['destination trop longue', { destination: 'a'.repeat(120), pays: 'France', prix: '10' }],
  ])('refuse un formulaire invalide : %s', async (libelle, champs) => {
    const res = await envoyer(champs);

    expect(res.status).toBe(400);
    expect(res.text).toContain('Enregistrement refusé');
  });

  test('refuse une description de plus de 2000 caractères', async () => {
    const res = await envoyer({
      destination: 'Nice',
      pays: 'France',
      prix: '10',
      description: 'a'.repeat(2001),
    });
    expect(res.status).toBe(400);
  });

  test('normalise le prix en nombre et applique la devise par défaut', async () => {
    await envoyer({ destination: 'Sienne', pays: 'Italie', prix: '149,90', devise: '' }).expect(
      303,
    );

    const voyage = voyageDeLaPage((await request(app).get('/voyages')).text, 9);
    expect(voyage).toBeDefined();
    expect(voyage.prix).toBe(149.9);
    expect(typeof voyage.prix).toBe('number');
    expect(voyage.devise).toBe('€');
  });

  test('ignore les champs non attendus', async () => {
    await envoyer({ destination: 'Gand', pays: 'Belgique', prix: '80', role: 'admin' }).expect(303);

    const voyage = voyageDeLaPage((await request(app).get('/voyages')).text, 9);
    expect(voyage.role).toBeUndefined();
    expect(Object.keys(voyage).sort()).toEqual([
      'description',
      'destination',
      'devise',
      'id',
      'image',
      'pays',
      'prix',
      'titre',
    ]);
  });

  test('un voyage existant reste modifiable avec des données valides', async () => {
    await request(app)
      .put('/voyages/5')
      .type('form')
      .send({
        _csrf: jeton,
        destination: 'Edimbourg',
        pays: 'Ecosse',
        prix: '210',
        devise: '£',
        image: 'https://exemple.fr/edimbourg.jpg',
        titre: 'Edimbourg',
        description: 'Une ville à découvrir',
      })
      .expect(303);

    const res = await request(app).get('/voyages/5').expect(200);
    expect(res.text).toContain('Edimbourg');
  });

  test('modifier un identifiant inexistant renvoie 404', async () => {
    await request(app)
      .put('/voyages/999')
      .type('form')
      .send({ _csrf: jeton, destination: 'Nice', pays: 'France', prix: '10' })
      .expect(404);
  });
});

describe('Documentation de l’API', () => {
  test('la documentation est disponible en développement', async () => {
    await request(app).get('/docs/').expect(200);
  });

  test('la documentation est absente en production', async () => {
    const appProduction = creerApp('production');
    await request(appProduction).get('/docs/').expect(404);
  });

  test('l’application fonctionne en production', async () => {
    const appProduction = creerApp('production');
    await request(appProduction).get('/').expect(200);
  });
});

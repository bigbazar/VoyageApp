/**
 * Bug 1 : un identifiant inconnu faisait planter la page (erreur 500).
 * Bug 4 : les identifiants pouvaient être réutilisés après une suppression.
 * Étape 4 : les modifications passent par les verbes REST.
 */
const request = require('supertest');
const { creerApp, jetonCsrf, voyagesDeLaPage } = require('./aide');

let app;
let jeton;

beforeEach(async () => {
  app = creerApp('development');
  jeton = await jetonCsrf(app);
});

const liste = () => request(app).get('/voyages');

describe('Affichage des voyages', () => {
  test("la page d'accueil liste les 8 voyages de départ", async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.text.match(/class="card col-2/g)).toHaveLength(8);
  });

  test('la collection est aussi disponible sur /voyages', async () => {
    const res = await liste().expect(200);
    expect(res.text.match(/class="card col-2/g)).toHaveLength(8);
  });

  test('un identifiant inexistant renvoie 404 au lieu d’une erreur 500', async () => {
    const res = await request(app).get('/voyages/999').expect(404);
    expect(res.text).toContain('Voyage non trouvé');
  });

  test('une URL sans identifiant numérique renvoie 404', async () => {
    await request(app).get('/voyages/abc').expect(404);
  });

  test('un voyage existant s’affiche seul', async () => {
    const res = await request(app).get('/voyages/3').expect(200);
    expect(res.text.match(/class="card col-2/g)).toHaveLength(1);
  });

  test('le détail est atteignable depuis sa propre URL', async () => {
    const res = await request(app).get('/voyages/3').expect(200);
    expect(res.text).toContain('href="/voyages/3"');
  });
});

describe('Création, modification et suppression', () => {
  test('la création renvoie 303 vers la liste et enregistre le voyage', async () => {
    await request(app)
      .post('/voyages')
      .type('form')
      .send({ _csrf: jeton, destination: 'Verone', pays: 'Italie', prix: '250', devise: '€' })
      .expect(303)
      .expect('Location', '/voyages');

    const res = await liste().expect(200);
    expect(res.text).toContain('Verone');
  });

  test('la modification passe par PUT /voyages/:id', async () => {
    await request(app)
      .put('/voyages/3')
      .type('form')
      .send({ _csrf: jeton, destination: 'Bruxelles', pays: 'Belgique', prix: '180', devise: '€' })
      .expect(303);

    const res = await request(app).get('/voyages/3').expect(200);
    expect(res.text).toContain('Bruxelles');
  });

  test('la suppression passe par DELETE /voyages/:id', async () => {
    await request(app).delete('/voyages/1').set('x-csrf-token', jeton).expect(303);
    await request(app).get('/voyages/1').expect(404);
  });

  test('les formulaires peuvent utiliser _method pour PUT', async () => {
    await request(app)
      .post('/voyages/2')
      .type('form')
      .send({
        _method: 'PUT',
        _csrf: jeton,
        destination: 'Porto',
        pays: 'Portugal',
        prix: '140',
        devise: '€',
      })
      .expect(303);

    const res = await request(app).get('/voyages/2').expect(200);
    expect(res.text).toContain('140');
  });

  test('un POST direct sur /voyages/:id ne modifie rien', async () => {
    await request(app)
      .post('/voyages/3')
      .type('form')
      .send({ _csrf: jeton, destination: 'Pirate', pays: 'X', prix: '1' })
      .expect(404);

    const res = await request(app).get('/voyages/3').expect(200);
    expect(res.text).not.toContain('Pirate');
  });
});

describe('Identifiants', () => {
  test('après une suppression, le nouvel identifiant ne réutilise pas une valeur prise', async () => {
    await request(app)
      .post('/voyages/1')
      .type('form')
      .send({ _method: 'DELETE', _csrf: jeton })
      .expect(303);

    await request(app)
      .post('/voyages')
      .type('form')
      .send({ _csrf: jeton, destination: 'TestUnique', pays: 'Test', prix: '50', devise: '€' })
      .expect(303);

    const voyages = voyagesDeLaPage((await liste()).text);
    expect(voyages.find((voyage) => voyage.destination === 'TestUnique').id).toBe(9);
    expect(voyages.filter((voyage) => voyage.id === 8)).toHaveLength(1);
  });

  test('modifier un voyage conserve son identifiant sans le dupliquer', async () => {
    await request(app)
      .post('/voyages/3')
      .type('form')
      .send({
        _method: 'PUT',
        _csrf: jeton,
        destination: 'Gand',
        pays: 'Belgique',
        prix: '90',
        devise: '€',
      })
      .expect(303);

    const identifiants = voyagesDeLaPage((await liste()).text).map((voyage) => voyage.id);
    expect(identifiants.filter((id) => id === 3)).toHaveLength(1);
    expect(new Set(identifiants).size).toBe(8);
  });

  test('les identifiants restent uniques après plusieurs opérations', async () => {
    await request(app)
      .post('/voyages/2')
      .type('form')
      .send({ _method: 'DELETE', _csrf: jeton })
      .expect(303);
    await request(app)
      .post('/voyages')
      .type('form')
      .send({ _csrf: jeton, destination: 'Oslo', pays: 'Norvege', prix: '300', devise: '€' })
      .expect(303);

    const identifiants = voyagesDeLaPage((await liste()).text).map((voyage) => voyage.id);
    expect(identifiants).toHaveLength(8);
    expect(new Set(identifiants).size).toBe(8);
  });

  test('supprimer un identifiant invalide renvoie 404', async () => {
    await request(app)
      .post('/voyages/abc')
      .type('form')
      .send({ _method: 'DELETE', _csrf: jeton })
      .expect(404);
  });
});

describe('Autres routes', () => {
  test('une route inconnue affiche la page d’erreur', async () => {
    const res = await request(app).get('/users/inconnu').expect(404);
    expect(res.text).toContain('Not Found');
  });

  test('la route users répond', async () => {
    const res = await request(app).get('/users').expect(200);
    expect(res.text).toBe('respond with a resource');
  });
});

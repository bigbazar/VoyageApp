/**
 * Bug 1 : un identifiant inconnu faisait planter la page (erreur 500).
 * Bug 4 : les identifiants pouvaient être réutilisés après une suppression.
 */
const request = require('supertest');
const { creerApp, jetonCsrf, voyagesDeLaPage } = require('./aide');

let app;
let jeton;

beforeEach(async () => {
  app = creerApp('development');
  jeton = await jetonCsrf(app);
});

describe('Affichage des voyages', () => {
  test("la page d'accueil liste les 8 voyages de départ", async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.text.match(/class="card col-2/g)).toHaveLength(8);
  });

  test('un identifiant inexistant renvoie 404 au lieu d’une erreur 500', async () => {
    const res = await request(app).get('/999').expect(404);
    expect(res.text).toContain('Voyage non trouvé');
  });

  test('une URL sans identifiant numérique renvoie 404', async () => {
    await request(app).get('/favicon.ico').expect(404);
  });

  test('un voyage existant s’affiche seul', async () => {
    const res = await request(app).get('/3').expect(200);
    expect(res.text.match(/class="card col-2/g)).toHaveLength(1);
  });
});

describe('Identifiants', () => {
  test('après une suppression, le nouvel identifiant ne réutilise pas une valeur prise', async () => {
    await request(app).post('/delete/1').type('form').send({ _csrf: jeton }).expect(200);

    const res = await request(app)
      .post('/update')
      .type('form')
      .send({ _csrf: jeton, destination: 'TestUnique', pays: 'Test', prix: '50', devise: '€' })
      .expect(200);

    const voyages = voyagesDeLaPage(res.text);
    expect(voyages.find((voyage) => voyage.destination === 'TestUnique').id).toBe(9);
    expect(voyages.filter((voyage) => voyage.id === 8)).toHaveLength(1);
  });

  test('le nouveau voyage est accessible par son identifiant', async () => {
    const res = await request(app)
      .post('/update')
      .type('form')
      .send({ _csrf: jeton, destination: 'Verone', pays: 'Italie', prix: '250', devise: '€' })
      .expect(200);

    const ajoute = voyagesDeLaPage(res.text).find((voyage) => voyage.destination === 'Verone');
    await request(app)
      .get('/' + ajoute.id)
      .expect(200);
  });

  test('modifier un voyage conserve son identifiant sans le dupliquer', async () => {
    const res = await request(app)
      .post('/update')
      .type('form')
      .send({
        _csrf: jeton,
        id: '3',
        destination: 'Bruxelles',
        pays: 'Belgique',
        prix: '180',
        devise: '€',
      })
      .expect(200);

    const identifiants = voyagesDeLaPage(res.text).map((voyage) => voyage.id);
    expect(identifiants.filter((id) => id === 3)).toHaveLength(1);
    await request(app).get('/3').expect(200);
  });

  test('les identifiants restent uniques après plusieurs opérations', async () => {
    await request(app).post('/delete/2').type('form').send({ _csrf: jeton }).expect(200);
    const res = await request(app)
      .post('/update')
      .type('form')
      .send({ _csrf: jeton, destination: 'Oslo', pays: 'Norvege', prix: '300', devise: '€' })
      .expect(200);

    const identifiants = voyagesDeLaPage(res.text).map((voyage) => voyage.id);
    expect(identifiants).toHaveLength(8);
    expect(new Set(identifiants).size).toBe(8);
  });

  test('supprimer un identifiant invalide renvoie 404', async () => {
    await request(app).post('/delete/abc').type('form').send({ _csrf: jeton }).expect(404);
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

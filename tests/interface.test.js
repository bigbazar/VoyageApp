/**
 * Étape 5 : confort d'usage (confirmations, messages, mise en page) et
 * accessibilité (libellés, textes alternatifs, entête rendue par le serveur).
 */
const request = require('supertest');
const { creerApp, jetonCsrf } = require('./aide');

let app;
let jeton;

beforeEach(async () => {
  app = creerApp('development');
  jeton = await jetonCsrf(app);
});

const prixFormate = (valeur) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(valeur);

describe('Confort d’usage', () => {
  test('une suppression demande toujours confirmation', async () => {
    const res = await request(app).get('/voyages').expect(200);

    expect(res.text.match(/data-confirmation="/g)).toHaveLength(8);
    expect(res.text).toContain('data-confirmation="Supprimer le voyage à Rome ?"');
  });

  test('chaque action affiche un message de confirmation', async () => {
    const creation = await request(app).get('/voyages?fait=creation').expect(200);
    expect(creation.text).toContain('Le voyage a été ajouté.');

    const modification = await request(app).get('/voyages?fait=modification').expect(200);
    expect(modification.text).toContain('Le voyage a été mis à jour.');

    const suppression = await request(app).get('/voyages?fait=suppression').expect(200);
    expect(suppression.text).toContain('Le voyage a été supprimé.');
  });

  test('un paramètre fait inconnu n’affiche aucun message', async () => {
    const res = await request(app).get('/voyages?fait=nimportequoi').expect(200);
    expect(res.text).not.toContain('alert-success');
  });

  test('une création redirige vers la liste avec son message', async () => {
    await request(app)
      .post('/voyages')
      .type('form')
      .send({ _csrf: jeton, destination: 'Turin', pays: 'Italie', prix: '90', devise: '€' })
      .expect(303)
      .expect('Location', '/voyages?fait=creation');
  });

  test('une modification et une suppression annoncent leur résultat', async () => {
    await request(app)
      .put('/voyages/3')
      .type('form')
      .send({ _csrf: jeton, destination: 'Gand', pays: 'Belgique', prix: '90', devise: '€' })
      .expect(303)
      .expect('Location', '/voyages?fait=modification');

    await request(app)
      .delete('/voyages/3')
      .set('x-csrf-token', jeton)
      .expect(303)
      .expect('Location', '/voyages?fait=suppression');
  });

  test('les prix sont affichés au format français', async () => {
    await request(app)
      .post('/voyages')
      .type('form')
      .send({ _csrf: jeton, destination: 'Turin', pays: 'Italie', prix: '1200', devise: '€' })
      .expect(303);

    const res = await request(app).get('/voyages').expect(200);
    expect(res.text).toContain(prixFormate(1200));
    expect(res.text).toContain(prixFormate(600));
  });
});

describe('Accessibilité', () => {
  test('les boutons d’icône portent un libellé explicite', async () => {
    const res = await request(app).get('/voyages').expect(200);

    expect(res.text.match(/aria-label="Modifier le voyage à /g)).toHaveLength(8);
    expect(res.text.match(/aria-label="Supprimer le voyage à /g)).toHaveLength(8);
    expect(res.text).toContain('aria-label="Rechercher"');
  });

  test('les icônes sont ignorées par les lecteurs d’écran', async () => {
    const res = await request(app).get('/voyages').expect(200);
    expect(res.text).toContain('<i class="fas fa-search" aria-hidden="true"></i>');
  });

  test('les images décrivent la destination', async () => {
    const res = await request(app).get('/voyages').expect(200);

    expect(res.text).toContain('alt="Voyage à Rome"');
    expect(res.text).not.toContain('Card image cap');
  });

  test('le titre de la fenêtre modale est correctement référencé', async () => {
    const res = await request(app).get('/voyages').expect(200);

    expect(res.text).toContain('aria-labelledby="modalVoyageLongTitle"');
    expect(res.text).toContain('id="modalVoyageLongTitle"');
  });

  test('l’entête est rendue par le serveur, sans JavaScript', async () => {
    const res = await request(app).get('/voyages').expect(200);

    expect(res.text).toContain('navbar-brand');
    expect(res.text).toContain('Tous les voyages');
    expect(res.text).not.toContain('javascripts/entete.js');
  });

  test('aucun gestionnaire d’événement en ligne ne subsiste', async () => {
    const res = await request(app).get('/voyages').expect(200);

    expect(res.text).not.toContain('onclick=');
    expect(res.text).not.toContain('onerror=');
  });
});

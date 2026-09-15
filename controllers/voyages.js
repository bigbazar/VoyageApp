/**
 * Contrôleurs HTTP des voyages : ils valident l'entrée, appellent le dépôt et
 * choisissent la réponse à renvoyer. Aucune donnée n'est stockée ici.
 */
const depot = require('../repositories/voyages.js');
const validerVoyage = require('../validators/voyage.js').validerVoyage;

const TITRE = 'Vacances de rêves';

/** Message affiché après une action, transmis par l'URL de redirection. */
const MESSAGES = new Map([
  ['creation', 'Le voyage a été ajouté.'],
  ['modification', 'Le voyage a été mis à jour.'],
  ['suppression', 'Le voyage a été supprimé.'],
]);

/** Affiche la liste, éventuellement filtrée par une recherche (?q=…). */
function lister(req, res) {
  const recherche = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const fait = typeof req.query.fait === 'string' ? req.query.fait : '';

  res.render('listVoyages', {
    title: TITRE,
    voyages: depot.lister({ recherche: recherche }),
    recherche: recherche,
    erreur: null,
    message: MESSAGES.get(fait) || null,
  });
}

function afficher(req, res) {
  const voyage = depot.trouver(req.params.id);
  if (!voyage) return res.status(404).send('Voyage non trouvé.');

  res.render('listVoyages', {
    title: TITRE,
    voyages: [voyage],
    recherche: '',
    erreur: null,
    message: null,
  });
}

/** Réaffiche la liste en expliquant pourquoi le formulaire a été refusé. */
function refuser(res, erreurs) {
  res.status(400).render('listVoyages', {
    title: TITRE,
    voyages: depot.lister(),
    recherche: '',
    erreur: erreurs.join(' '),
    message: null,
  });
}

// POST /voyages
function creer(req, res) {
  const resultat = validerVoyage(req.body);
  if (resultat.erreurs.length > 0) return refuser(res, resultat.erreurs);

  depot.creer(resultat.voyage);
  res.redirect(303, '/voyages?fait=creation');
}

// PUT /voyages/:id
function modifier(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || !depot.trouver(id)) return res.status(404).send('Voyage non trouvé.');

  const resultat = validerVoyage(req.body);
  if (resultat.erreurs.length > 0) return refuser(res, resultat.erreurs);

  depot.modifier(id, resultat.voyage);
  res.redirect(303, '/voyages?fait=modification');
}

// DELETE /voyages/:id
function supprimer(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || !depot.supprimer(id)) return res.status(404).send('Voyage non trouvé.');

  res.redirect(303, '/voyages?fait=suppression');
}

module.exports = {
  lister: lister,
  afficher: afficher,
  creer: creer,
  modifier: modifier,
  supprimer: supprimer,
};

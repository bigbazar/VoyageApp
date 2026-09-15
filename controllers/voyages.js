/**
 * Contrôleurs HTTP des voyages : ils valident l'entrée, appellent le dépôt et
 * choisissent la réponse à renvoyer. Aucune donnée n'est stockée ici.
 */
const depot = require('../repositories/voyages.js');
const validerVoyage = require('../validators/voyage.js').validerVoyage;

const TITRE = 'Vacances de rêves';

/** Affiche la liste, éventuellement filtrée par une recherche (?q=…). */
function lister(req, res) {
  const recherche = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  res.render('listVoyages', {
    title: TITRE,
    voyages: depot.lister({ recherche: recherche }),
    recherche: recherche,
    erreur: null,
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
  });
}

/** Réaffiche la liste en expliquant pourquoi le formulaire a été refusé. */
function refuser(res, erreurs) {
  res.status(400).render('listVoyages', {
    title: TITRE,
    voyages: depot.lister(),
    recherche: '',
    erreur: erreurs.join(' '),
  });
}

// POST /voyages
function creer(req, res) {
  const resultat = validerVoyage(req.body);
  if (resultat.erreurs.length > 0) return refuser(res, resultat.erreurs);

  depot.creer(resultat.voyage);
  res.redirect(303, '/voyages');
}

// PUT /voyages/:id
function modifier(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || !depot.trouver(id)) return res.status(404).send('Voyage non trouvé.');

  const resultat = validerVoyage(req.body);
  if (resultat.erreurs.length > 0) return refuser(res, resultat.erreurs);

  depot.modifier(id, resultat.voyage);
  res.redirect(303, '/voyages');
}

// DELETE /voyages/:id
function supprimer(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || !depot.supprimer(id)) return res.status(404).send('Voyage non trouvé.');

  res.redirect(303, '/voyages');
}

module.exports = {
  lister: lister,
  afficher: afficher,
  creer: creer,
  modifier: modifier,
  supprimer: supprimer,
};

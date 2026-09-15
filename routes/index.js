var express = require('express');
var router = express.Router();
var BaseVoyages = require('../models/BaseVoyages.js')

let listVoyages = [...BaseVoyages];

const Title = 'Vacances de rêves';

/* GET home page. */
// Route pour récupérer tous les voyages
router.get('/', function(req, res, next) {
  sortListVoyages();
  res.render('listVoyages', { title: Title, voyages: listVoyages});
});

// Route pour récupérer un voyage par son ID
router.get("/:id", (req, res, next) => {
  // Un tableau est toujours "vrai" en JavaScript : on cherche directement le voyage
  // pour que le 404 fonctionne réellement quand l'id n'existe pas.
  const voyage = listVoyages.find(voyage => voyage.id === parseInt(req.params.id, 10));
  if (!voyage) return res.status(404).send("Voyage non trouvé.");
  sortListVoyages();
  res.render('listVoyages', { title: Title, voyages: [voyage]});
});

// Route pour rechercher un voyage
router.post('/search', (req, res, next) => {
  const searchVoyage = (req.body.searchVoyage || '').trim();
  const terme = searchVoyage.toLowerCase();
  const prixMax = parseInt(searchVoyage, 10);

  // Un seul filtre : un voyage ne peut plus être ajouté deux fois dans le résultat.
  // Un champ vide renvoie toute la liste, et les prix ne sont comparés que sur un nombre valide.
  const _voyages = listVoyages.filter(e =>
    e.destination.toLowerCase().indexOf(terme) > -1 ||
    e.pays.toLowerCase().indexOf(terme) > -1 ||
    (terme !== '' && !isNaN(prixMax) && e.prix <= prixMax)
  );

  if (_voyages.length === 0) return res.status(404).send("Voyage non trouvé.");
  res.render('listVoyages', { title: Title, voyages: _voyages});
});

// Route pour ajouter un voyage
router.post('/update', function(req, res, next) {
  let voyage = { ...req.body };
  if (voyage.id == undefined || voyage.id == '') {
    // Le plus grand id existant + 1 : l'ancien calcul (longueur + 1) réutilisait
    // un id déjà pris après une suppression.
    voyage.id = listVoyages.reduce((max, e) => Math.max(max, parseInt(e.id, 10) || 0), 0) + 1;
  } else {
    // L'id arrive en chaîne depuis le formulaire : on le stocke en number pour que
    // la recherche par id, la suppression et l'édition restent cohérentes.
    voyage.id = parseInt(voyage.id, 10);
    // Filtre sur l'id stocké en number et string
    let newlistVoyages = listVoyages.filter(e => e.id !== voyage.id && e.id !== String(voyage.id));
    listVoyages = [];
    listVoyages = [...newlistVoyages];
  }
  listVoyages.push(voyage);
  sortListVoyages();
  res.render('listVoyages', { title: Title, voyages: listVoyages});
});

// Route pour supprimer un voyage
router.post('/delete/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  listVoyages = [...listVoyages.filter(e => e.id !== id)];
  sortListVoyages();
  res.render('listVoyages', { title: Title, voyages: listVoyages});
});

function sortListVoyages() {
  listVoyages.sort((a,b) => {
    if (a.destination < b.destination) return -1;
    if (a.destination > b.destination) return 1;
    return 0
  });
}

module.exports = router;

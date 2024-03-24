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
  const voyage = [];
  voyage.push(listVoyages.find(voyage => voyage.id === parseInt(req.params.id)));
  if (!voyage) return res.status(404).send("Voyage non trouvé.");
  sortListVoyages();
  res.render('listVoyages', { title: Title, voyages: voyage});
});

// Route pour rechercher un voyage
router.post('/search', (req, res, next) => {
  const _voyages = [];
  let searchVoyage = req.body.searchVoyage;
  
  const destination = listVoyages.filter(e => e.destination.toLowerCase().indexOf(searchVoyage.toLowerCase()) > -1);
  if (destination) _voyages.push.apply(_voyages, destination);
  const pays = listVoyages.filter(e => e.pays.toLowerCase().indexOf(searchVoyage.toLowerCase()) > -1);
  if (pays) _voyages.push.apply(_voyages, pays);
  const prix = listVoyages.filter(e => e.prix <= parseInt(searchVoyage));
  if (prix) _voyages.push.apply(_voyages, prix);  

  if (!_voyages || _voyages.length === 0) return res.status(404).send("Voyage non trouvé.");

  res.render('listVoyages', { title: Title, voyages: _voyages});
});

// Route pour ajouter un voyage
router.post('/update', function(req, res, next) {
  let voyage = req.body;
  if (voyage.id == undefined || voyage.id == '') {
    voyage.id = listVoyages.length + 1;
  } else {
    // Filtre sur l'id stocké en number et string
    let newlistVoyages = listVoyages.filter(e => e.id !== parseInt(voyage.id) && e.id !== voyage.id);
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

/**
 * Page d'accueil : elle affiche la même liste que GET /voyages.
 */
var express = require('express');
var router = express.Router();
var controleur = require('../controllers/voyages.js');

router.get('/', controleur.lister);

module.exports = router;

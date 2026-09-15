/**
 * Routes REST de la ressource « voyages ».
 *
 *   GET    /voyages          liste (filtrable par ?q=)
 *   POST   /voyages          création
 *   GET    /voyages/:id      détail
 *   PUT    /voyages/:id      modification
 *   DELETE /voyages/:id      suppression
 *
 * Les vues utilisent un champ caché _method pour les trois derniers verbes
 * (voir middlewares/methodOverride.js).
 */
const express = require('express');
const router = express.Router();
const controleur = require('../controllers/voyages.js');

router.get('/', controleur.lister);
router.post('/', controleur.creer);
router.get('/:id', controleur.afficher);
router.put('/:id', controleur.modifier);
router.delete('/:id', controleur.supprimer);

module.exports = router;

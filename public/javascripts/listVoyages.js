/**
 * Comportements de la page : préparer le formulaire d'édition avec les données
 * de la carte, le remettre à zéro pour un ajout, et demander confirmation avant
 * une suppression.
 *
 * Les gestionnaires sont posés ici plutôt que dans des attributs onclick : la
 * politique de sécurité du contenu peut ainsi interdire le JavaScript en ligne.
 */

function editVoyage(button) {
  // Les données du voyage sont lues depuis l'attribut data-voyage (JSON)
  const voyage = JSON.parse(button.dataset.voyage);
  const formulaire = document.getElementById('formVoyage');

  // L'édition utilise PUT /voyages/:id
  formulaire.action = '/voyages/' + voyage.id;
  document.getElementById('methodeUpdate').disabled = false;

  // Affecter les valeurs dans les champs du formulaire
  document.getElementById('destination').value = voyage.destination ?? '';
  document.getElementById('pays').value = voyage.pays ?? '';
  document.getElementById('prix').value = voyage.prix ?? '';
  document.getElementById('devise').value = voyage.devise ?? '';
  document.getElementById('image').value = voyage.image ?? '';
  document.getElementById('titre').value = voyage.titre ?? '';
  document.getElementById('description').value = voyage.description ?? '';
}

function clearModal() {
  const formulaire = document.getElementById('formVoyage');

  // Retour en création : POST /voyages
  formulaire.action = '/voyages';
  document.getElementById('methodeUpdate').disabled = true;

  // Affecter les valeurs dans les champs du formulaire
  document.getElementById('destination').value = '';
  document.getElementById('pays').value = '';
  document.getElementById('prix').value = '';
  document.getElementById('devise').value = '';
  document.getElementById('image').value = '';
  document.getElementById('titre').value = '';
  document.getElementById('description').value = '';
}

/** Le bouton « Ajouter Voyage » ouvre le formulaire vide. */
function brancherAjout() {
  const bouton = document.getElementById('dialogVoyage');
  if (bouton) bouton.addEventListener('click', clearModal);
}

/** Chaque carte remplit le formulaire avec ses propres données. */
function brancherEdition() {
  document.querySelectorAll('.btn-editer').forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      editVoyage(bouton);
    });
  });
}

/** Une suppression n'est jamais silencieuse : elle demande confirmation. */
function brancherConfirmations() {
  document.querySelectorAll('form[data-confirmation]').forEach(function (formulaire) {
    formulaire.addEventListener('submit', function (evenement) {
      if (!window.confirm(formulaire.dataset.confirmation)) {
        evenement.preventDefault();
      }
    });
  });
}

/**
 * Vignette affichée à la place d'une image distante indisponible, pour éviter
 * l'icône d'image cassée du navigateur.
 */
const VIGNETTE_INDISPONIBLE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">' +
      '<rect width="400" height="200" fill="#e9ecef"/>' +
      '<text x="200" y="108" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#6c757d">' +
      'Image indisponible</text></svg>',
  );

function brancherImagesDefaillantes() {
  document.querySelectorAll('img.card-img-top').forEach(function (image) {
    const remplacer = function () {
      if (image.dataset.vignette) return;
      image.dataset.vignette = 'oui';
      image.src = VIGNETTE_INDISPONIBLE;
    };

    image.addEventListener('error', remplacer);
    // L'image a pu échouer avant l'exécution du script
    if (image.complete && image.naturalWidth === 0) remplacer();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  brancherAjout();
  brancherEdition();
  brancherConfirmations();
  brancherImagesDefaillantes();
});

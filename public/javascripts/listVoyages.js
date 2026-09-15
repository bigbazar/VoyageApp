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

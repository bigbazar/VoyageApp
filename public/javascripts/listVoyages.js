function editVoyage(button) {
      // Les données du voyage sont lues depuis l'attribut data-voyage (JSON)
      const voyage = JSON.parse(button.dataset.voyage);

      // Affecter les valeurs dans les champs du formulaire  
      document.getElementById('idUpdate').value = voyage.id ?? '';    
      document.getElementById('destination').value = voyage.destination ?? '';
      document.getElementById('pays').value = voyage.pays ?? '';
      document.getElementById('prix').value = voyage.prix ?? '';
      document.getElementById('devise').value = voyage.devise ?? '';
      document.getElementById('image').value = voyage.image ?? '';
      document.getElementById('titre').value = voyage.titre ?? '';
      document.getElementById('description').value = voyage.description ?? '';
}

function clearModal() {
  // Affecter les valeurs dans les champs du formulaire  
  document.getElementById('idUpdate').value = '';    
  document.getElementById('destination').value = '';
  document.getElementById('pays').value = '';
  document.getElementById('prix').value = '';
  document.getElementById('devise').value = '';
  document.getElementById('image').value = '';
  document.getElementById('titre').value = '';
  document.getElementById('description').value = '';
}



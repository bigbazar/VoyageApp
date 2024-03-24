function editVoyage(id, destination, pays, prix, devise, image, titre, description) {
      // Affecter les valeurs dans les champs du formulaire  
      document.getElementById('idUpdate').value = id;    
      document.getElementById('destination').value = destination;
      document.getElementById('pays').value = pays;
      document.getElementById('prix').value = prix;
      document.getElementById('devise').value = devise;
      document.getElementById('image').value = image;
      document.getElementById('titre').value = titre;
      document.getElementById('description').value = description;
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




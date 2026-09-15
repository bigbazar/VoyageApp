# VoyageApp
NodeJS Express Bootstrap

Lancement de l'application : npm start
Appli dispo sur : http://localhost:3000

# 15.09.26 23:25 Correction des bugs :
Identifiant inconnu — [routes/index.js (line 17)](/home/lionel/workgit/node/VoyageApp/routes/index.js:17) cherche désormais directement le voyage concerné au lieu de l'emballer dans un tableau (qui était toujours considéré comme « vrai », ce qui rendait le 404 inatteignable). /999 et /favicon.ico renvoient maintenant une vraie page 404 « Voyage non trouvé » au lieu d'une erreur 500.

Bouton modifier — [listVoyages.ejs (line 119)](/home/lionel/workgit/node/VoyageApp/views/listVoyages.ejs:119) transmet les données par un attribut data-voyage en JSON, et [listVoyages.js (line 1)](/home/lionel/workgit/node/VoyageApp/public/javascripts/listVoyages.js:1) lit cet attribut. Les descriptions contenant une apostrophe ne cassent plus le code, et il n'est plus possible d'injecter du JavaScript via le formulaire. Testé : le JSON de la carte New-York est correctement relu, apostrophe comprise.

Recherche — [routes/index.js (line 27)](/home/lionel/workgit/node/VoyageApp/routes/index.js:27) utilise un seul filtre au lieu de trois cumulés : plus de doublons. Un champ vide renvoie la liste complète au lieu de planter, et la comparaison de prix ne s'applique que si la saisie est bien un nombre.

Identifiants — [routes/index.js (line 50)](/home/lionel/workgit/node/VoyageApp/routes/index.js:50) prend le plus grand identifiant existant + 1, ce qui exclut toute réutilisation d'un id déjà pris après une suppression. J'ai aussi normalisé l'identifiant en nombre à l'enregistrement : sans cela, modifier un voyage le stockait en texte et cassait ensuite son lien de détail et sa suppression (c'était la même cause racine).


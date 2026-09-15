# VoyageApp
NodeJS Express Bootstrap

# Installation et lancement

```
npm install
npm start
```

Appli dispo sur : http://localhost:3000


# 15.09.26 23:25 Correction des bugs :
Identifiant inconnu — [routes/index.js (line 17)](/home/lionel/workgit/node/VoyageApp/routes/index.js:17) cherche désormais directement le voyage concerné au lieu de l'emballer dans un tableau (qui était toujours considéré comme « vrai », ce qui rendait le 404 inatteignable). /999 et /favicon.ico renvoient maintenant une vraie page 404 « Voyage non trouvé » au lieu d'une erreur 500.

Bouton modifier — [listVoyages.ejs (line 119)](/home/lionel/workgit/node/VoyageApp/views/listVoyages.ejs:119) transmet les données par un attribut data-voyage en JSON, et [listVoyages.js (line 1)](/home/lionel/workgit/node/VoyageApp/public/javascripts/listVoyages.js:1) lit cet attribut. Les descriptions contenant une apostrophe ne cassent plus le code, et il n'est plus possible d'injecter du JavaScript via le formulaire. Testé : le JSON de la carte New-York est correctement relu, apostrophe comprise.

Recherche — [routes/index.js (line 27)](/home/lionel/workgit/node/VoyageApp/routes/index.js:27) utilise un seul filtre au lieu de trois cumulés : plus de doublons. Un champ vide renvoie la liste complète au lieu de planter, et la comparaison de prix ne s'applique que si la saisie est bien un nombre.

Identifiants — [routes/index.js (line 50)](/home/lionel/workgit/node/VoyageApp/routes/index.js:50) prend le plus grand identifiant existant + 1, ce qui exclut toute réutilisation d'un id déjà pris après une suppression. J'ai aussi normalisé l'identifiant en nombre à l'enregistrement : sans cela, modifier un voyage le stockait en texte et cassait ensuite son lien de détail et sa suppression (c'était la même cause racine).

# 15.09.26 24:34  Sécuriser : validation des champs côté serveur, protection CSRF sur l'ajout/la suppression, en-têtes via helmet, et /docs (Swagger) réservé au développement. Le fichier Swagger documente d'ailleurs des routes qui n'existent plus.

Protection CSRF — nouvelle brique [middlewares/csrf.js (line 1)](/home/lionel/workgit/node/VoyageApp/middlewares/csrf.js:1), sans dépendance externe : le jeton est signé en HMAC-SHA256, comparé à temps constant, valable 2 heures, et déposé dans les vues via res.locals.csrfToken. Toute requête qui modifie l'état doit le renvoyer par le champ caché _csrf, ajouté aux 9 formulaires de [listVoyages.ejs (line 46)](/home/lionel/workgit/node/VoyageApp/views/listVoyages.ejs:46). La recherche est exemptée car elle ne fait que lire. Vérifié : un POST sans jeton renvoie 403 et ne modifie rien, un jeton falsifié est refusé, un jeton valide passe. Le secret se règle par la variable CSRF_SECRET — sinon il change à chaque redémarrage.
Validation serveur — nouvelle brique [validators/voyage.js (line 1)](/home/lionel/workgit/node/VoyageApp/validators/voyage.js:1). Elle est branchée dans [routes/index.js (line 46)](/home/lionel/workgit/node/VoyageApp/routes/index.js:46) et rejette une destination ou un pays vide, un prix absent, négatif, non numérique ou hors bornes, une devise inconnue, une image qui n'est pas en http(s), une description de plus de 2000 caractères. Elle ne recopie que les champs connus, donc un champ détourné comme role=admin est ignoré. En cas de refus, la page revient en 400 avec un message affiché ([listVoyages.ejs (line 28)](/home/lionel/workgit/node/VoyageApp/views/listVoyages.ejs:28)). Le prix est en outre stocké comme un vrai nombre, ce qui supprime la coercition implicite de chaînes.
En-têtes et documentation — [app.js (line 23)](/home/lionel/workgit/node/VoyageApp/app.js:23) applique helmet (version 8.3.0) avec une politique de sécurité du contenu calée sur les CDN réellement utilisés. Vérifié par requête réelle : nosniff, X-Frame-Options, Referrer-Policy, Content-Security-Policy, Strict-Transport-Security, et l'en-tête X-Powered-By qui a disparu. Le corps des requêtes est borné à 100 ko. Swagger n'est monté qu'en développement ([app.js (line 43)](/home/lionel/workgit/node/VoyageApp/app.js:43)) : /docs répond 200 en développement et 404 en production. J'ai aussi régénéré swagger_output.json, qui documentait encore /voyage/{id}, /search/{text} et /addVoyage — il décrit maintenant les six routes réelles.
Trois choses à connaître. La politique de sécurité du contenu conserve 'unsafe-inline', indispensable tant que les boutons utilisent des attributs onclick ; les remplacer par des écouteurs permettrait de le retirer. Les jetons CSRF ne sont pas stockés côté serveur : c'est simple et suffisant ici, mais à revoir si l'application gère un jour des sessions. Enfin, npm install signale 5 vulnérabilités dans les dépendances (4 modérées, 1 élevée) ; npm audit n'a pas pu interroger le registre depuis cet environnement, donc ce point reste à regarder de votre côté.
J'ai également corrigé au passage les quatre libellés for="'devise" du formulaire, qui contenaient une apostrophe parasite et n'étaient plus associés à leur champ.
Les modifications ne sont pas encore validées dans git (7 fichiers modifiés, 2 dossiers ajoutés). Je peux les committer, ou enchaîner sur l'étape 3 de la feuille de route — les tests automatisés avec jest et supertest — qui verrouillerait tout ce qui vient d'être fait.

## Variables d'environnement

| Variable | Rôle | Défaut |
| --- | --- | --- |
| `PORT` | port d'écoute | `3000` |
| `NODE_ENV` | `development` active la documentation Swagger | `development` |
| `CSRF_SECRET` | secret de signature des jetons CSRF ; à définir en production pour que les jetons restent valables après un redémarrage | tiré au hasard au démarrage |

## Documentation de l'API

Disponible uniquement hors production : http://localhost:3000/docs

Le fichier `swagger_output.json` est généré par `swagger-autogen` à partir des routes :
les commandes sont en commentaire au début de `app.js`.

## Sécurité

- **En-têtes** : `helmet` applique notamment une politique de sécurité du contenu
  limitée aux CDN utilisés par les vues (Bootstrap, jQuery, Font Awesome).
- **CSRF** : tout `POST` qui modifie les données doit porter un jeton signé, présent
  dans le champ caché `_csrf` des formulaires (`middlewares/csrf.js`).
- **Validation** : les voyages sont vérifiés et normalisés côté serveur avant
  enregistrement (`validators/voyage.js`) ; en cas d'erreur, le formulaire est
  refusé avec un code 400 et un message affiché sur la page.

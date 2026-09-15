# VoyageApp

NodeJS Express Bootstrap

# Installation et lancement

```
npm install
npm start
```

Appli dispo sur : http://localhost:3000

Prérequis : Node.js 18.18 ou plus (voir le champ `engines` de `package.json`).

# 15.09.26 23:25 Correction des bugs :

Identifiant inconnu — [routes/index.js (line 17)](/home/lionel/workgit/node/VoyageApp/routes/index.js:17) cherche désormais directement le voyage concerné au lieu de l'emballer dans un tableau (qui était toujours considéré comme « vrai », ce qui rendait le 404 inatteignable). /999 et /favicon.ico renvoient maintenant une vraie page 404 « Voyage non trouvé » au lieu d'une erreur 500.

Bouton modifier — [listVoyages.ejs (line 119)](/home/lionel/workgit/node/VoyageApp/views/listVoyages.ejs:119) transmet les données par un attribut data-voyage en JSON, et [listVoyages.js (line 1)](/home/lionel/workgit/node/VoyageApp/public/javascripts/listVoyages.js:1) lit cet attribut. Les descriptions contenant une apostrophe ne cassent plus le code, et il n'est plus possible d'injecter du JavaScript via le formulaire. Testé : le JSON de la carte New-York est correctement relu, apostrophe comprise.

Recherche — [routes/index.js (line 27)](/home/lionel/workgit/node/VoyageApp/routes/index.js:27) utilise un seul filtre au lieu de trois cumulés : plus de doublons. Un champ vide renvoie la liste complète au lieu de planter, et la comparaison de prix ne s'applique que si la saisie est bien un nombre.

Identifiants — [routes/index.js (line 50)](/home/lionel/workgit/node/VoyageApp/routes/index.js:50) prend le plus grand identifiant existant + 1, ce qui exclut toute réutilisation d'un id déjà pris après une suppression. J'ai aussi normalisé l'identifiant en nombre à l'enregistrement : sans cela, modifier un voyage le stockait en texte et cassait ensuite son lien de détail et sa suppression (c'était la même cause racine).

# 15.09.26 24:34 Sécuriser : validation des champs côté serveur, protection CSRF sur l'ajout/la suppression, en-têtes via helmet, et /docs (Swagger) réservé au développement. Le fichier Swagger documente d'ailleurs des routes qui n'existent plus.

Protection CSRF — nouvelle brique [middlewares/csrf.js (line 1)](/home/lionel/workgit/node/VoyageApp/middlewares/csrf.js:1), sans dépendance externe : le jeton est signé en HMAC-SHA256, comparé à temps constant, valable 2 heures, et déposé dans les vues via res.locals.csrfToken. Toute requête qui modifie l'état doit le renvoyer par le champ caché _csrf, ajouté aux 9 formulaires de [listVoyages.ejs (line 46)](/home/lionel/workgit/node/VoyageApp/views/listVoyages.ejs:46). La recherche est exemptée car elle ne fait que lire. Vérifié : un POST sans jeton renvoie 403 et ne modifie rien, un jeton falsifié est refusé, un jeton valide passe. Le secret se règle par la variable CSRF_SECRET — sinon il change à chaque redémarrage.

Validation serveur — nouvelle brique [validators/voyage.js (line 1)](/home/lionel/workgit/node/VoyageApp/validators/voyage.js:1). Elle est branchée dans [routes/index.js (line 46)](/home/lionel/workgit/node/VoyageApp/routes/index.js:46) et rejette une destination ou un pays vide, un prix absent, négatif, non numérique ou hors bornes, une devise inconnue, une image qui n'est pas en http(s), une description de plus de 2000 caractères. Elle ne recopie que les champs connus, donc un champ détourné comme role=admin est ignoré. En cas de refus, la page revient en 400 avec un message affiché ([listVoyages.ejs (line 28)](/home/lionel/workgit/node/VoyageApp/views/listVoyages.ejs:28)). Le prix est en outre stocké comme un vrai nombre, ce qui supprime la coercition implicite de chaînes.

En-têtes et documentation — [app.js (line 23)](/home/lionel/workgit/node/VoyageApp/app.js:23) applique helmet (version 8.3.0) avec une politique de sécurité du contenu calée sur les CDN réellement utilisés. Vérifié par requête réelle : nosniff, X-Frame-Options, Referrer-Policy, Content-Security-Policy, Strict-Transport-Security, et l'en-tête X-Powered-By qui a disparu. Le corps des requêtes est borné à 100 ko. Swagger n'est monté qu'en développement ([app.js (line 43)](/home/lionel/workgit/node/VoyageApp/app.js:43)) : /docs répond 200 en développement et 404 en production. J'ai aussi régénéré swagger_output.json, qui documentait encore /voyage/{id}, /search/{text} et /addVoyage — il décrit maintenant les six routes réelles.
Trois choses à connaître. La politique de sécurité du contenu conserve 'unsafe-inline', indispensable tant que les boutons utilisent des attributs onclick ; les remplacer par des écouteurs permettrait de le retirer. Les jetons CSRF ne sont pas stockés côté serveur : c'est simple et suffisant ici, mais à revoir si l'application gère un jour des sessions. Enfin, npm install signale 5 vulnérabilités dans les dépendances (4 modérées, 1 élevée) ; npm audit n'a pas pu interroger le registre depuis cet environnement, donc ce point reste à regarder de votre côté.
J'ai également corrigé au passage les quatre libellés for="'devise" du formulaire, qui contenaient une apostrophe parasite et n'étaient plus associés à leur champ.
Les modifications ne sont pas encore validées dans git (7 fichiers modifiés, 2 dossiers ajoutés). Je peux les committer, ou enchaîner sur l'étape 3 de la feuille de route — les tests automatisés avec jest et supertest — qui verrouillerait tout ce qui vient d'être fait.

## Variables d'environnement

| Variable            | Rôle                                                                                                                    | Défaut                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `PORT`              | port d'écoute                                                                                                           | `3000`                      |
| `NODE_ENV`          | `development` active la documentation Swagger                                                                           | `development`               |
| `CSRF_SECRET`       | secret de signature des jetons CSRF ; à définir en production pour que les jetons restent valables après un redémarrage | tiré au hasard au démarrage |
| `VOYAGES_DATA_FILE` | chemin du fichier de données des voyages                                                                                | `data/voyages.json`         |
| `HOST`              | interface d'écoute : `127.0.0.1` en développement (non exposé au réseau), `0.0.0.0` en production                       | selon `NODE_ENV`            |

## Documentation de l'API

Disponible uniquement hors production : http://localhost:3000/docs

Le fichier `swagger_output.json` est généré par `swagger-autogen` à partir des routes :
les commandes sont en commentaire au début de `app.js`.

## Sécurité

- **En-têtes** : `helmet` applique notamment une politique de sécurité du contenu
  limitée aux CDN utilisés par les vues (Bootstrap, jQuery, Font Awesome).
- **JavaScript en ligne** : interdit par la politique de sécurité du contenu ; les
  comportements de la page sont branchés dans `public/javascripts/listVoyages.js`.
- **CSRF** : tout `POST` qui modifie les données doit porter un jeton signé, présent
  dans le champ caché `_csrf` des formulaires (`middlewares/csrf.js`).
- **Validation** : les voyages sont vérifiés et normalisés côté serveur avant
  enregistrement (`validators/voyage.js`) ; en cas d'erreur, le formulaire est
  refusé avec un code 400 et un message affiché sur la page.

# 15.09.2026 23:54 Tests et qualité

Les tests automatisés utilisent `jest` et `supertest` : ils démarrent l'application
sur un port éphémère, aucun serveur n'est à lancer à la main.

```
npm test               # suite de tests complète
npm run test:coverage  # avec le rapport de couverture
npm run lint           # ESLint
npm run format         # applique le formatage Prettier
npm run format:check   # vérifie le formatage sans modifier les fichiers
```

Les fichiers `views/*.ejs` ne sont pas formatés automatiquement, Prettier ne
sachant pas les analyser.

Les tests — suite jest + supertest dans tests/, un fichier par thème, avec un assistant commun ([aide.js (line 1)](/home/lionel/workgit/node/VoyageApp/tests/aide.js:1)) qui repart d'une application neuve à chaque test (chacun travaille sur son propre fichier de données temporaire, sinon les tests s'influenceraient entre eux), récupère le jeton CSRF de la page et relit le JSON des cartes exactement comme le fait le navigateur.

- [voyages.test.js (line 1)](/home/lionel/workgit/node/VoyageApp/tests/voyages.test.js:1) — bug 1 (identifiant inconnu, URL non numérique) et bug 4 (identifiants uniques après suppression, édition qui conserve l'id, suppression invalide).
- [recherche.test.js (line 1)](/home/lionel/workgit/node/VoyageApp/tests/recherche.test.js:1) — bug 3 : absence de doublons, champ vide ou absent, recherche par destination, pays et prix, et l'exemption CSRF de cette route.
- [formulaire.test.js (line 1)](/home/lionel/workgit/node/VoyageApp/tests/formulaire.test.js:1) — bug 2 : plus d'arguments dans onclick, JSON exploitable malgré l'apostrophe de « d'Ellis Island », huit champs par carte.
- [securite.test.js (line 1)](/home/lionel/workgit/node/VoyageApp/tests/securite.test.js:1) — en-têtes helmet, CSRF (sans jeton, jeton falsifié, jeton valide), dix cas de validation refusés, normalisation du prix, champs détournés ignorés, /docs présent en développement et absent en production.

Couverture mesurée : 96 % des lignes, 88,6 % des branches, 100 % des fonctions. Les zones non couvertes sont des branches défensives (signature de jeton invalide, quelques règles de validation).

Lint et format — eslint.config.js (format flat config) et .prettierrc + .prettierignore, avec les scripts npm run lint, lint:fix, format et format:check dans [package.json (line 5)](/home/lionel/workgit/node/VoyageApp/package.json:5). Zéro erreur de lint, formatage conforme. Deux points à signaler : j'ai d'abord installé ESLint 10, qui exige Node ≥ 20, et je suis redescendu en ESLint 9 puisque votre machine est en Node 18 — pensez-y si vous montez de version plus tard. Par ailleurs Prettier ne sait pas analyser les .ejs, donc les vues sont exclues du formatage automatique.

Un bug découvert par les tests : la route /:id interceptait /users, ce qui rendait routes/users.js inaccessible (404). Le motif est maintenant limité aux identifiants numériques dans [routes/index.js (line 18)](/home/lionel/workgit/node/VoyageApp/routes/index.js:18). J'ai aussi coupé le journal des requêtes pendant les tests pour que la sortie reste lisible.

Le README.md gagne une section « Tests et qualité », et le rapport d'audit est à jour.
Deux réserves honnêtes. Les tests démarrent l'application sur un port local éphémère : dans cet environnement cloisonné j'ai dû demander une autorisation à chaque exécution, mais sur votre machine npm test fonctionne directement. Et le diff est volumineux (environ 6 300 lignes ajoutées) — l'essentiel vient du package-lock.json avec les nouvelles dépendances de développement, le reste étant le formatage de 20 fichiers et les tests eux-mêmes.

# 16.09.2026 00:15 sortir les données du routeur vers une couche de persistance et passer à des routes REST

La couche de données — [repositories/voyages.js (line 1)](/home/lionel/workgit/node/VoyageApp/repositories/voyages.js:1) expose lister, trouver, creer, modifier et supprimer, et gère seul la persistance dans data/voyages.json. Chaque écriture passe par un fichier temporaire renommé ensuite, donc le fichier de données n'est jamais laissé à moitié écrit ; s'il est absent ou illisible, il est recréé depuis models/BaseVoyages.js. Le chemin se règle par VOYAGES_DATA_FILE, ce qui permet aux tests de travailler sur leurs propres fichiers sans jamais toucher aux vraies données.

Les routes REST — [routes/voyages.js (line 1)](/home/lionel/workgit/node/VoyageApp/routes/voyages.js:1) déclare GET /voyages, GET /voyages/:id, POST /voyages, PUT /voyages/:id et DELETE /voyages/:id. Comme un formulaire HTML ne sait envoyer que GET et POST, les vues ajoutent un champ caché _method que [methodOverride.js (line 1)](/home/lionel/workgit/node/VoyageApp/middlewares/methodOverride.js:1) traduit en PUT ou DELETE ; la protection CSRF continue de s'appliquer puisqu'elle ne dépend pas du verbe. Les contrôleurs sont dans [controllers/voyages.js (line 1)](/home/lionel/workgit/node/VoyageApp/controllers/voyages.js:1) : validation, appel du dépôt, choix de la vue. [routes/index.js (line 1)](/home/lionel/workgit/node/VoyageApp/routes/index.js:1) ne contient plus que la page d'accueil.

Trois améliorations découlent directement de cette restructuration. La recherche est devenue GET /voyages?q=… : l'URL est partageable, plus aucune route n'a besoin d'être exemptée du CSRF, et une recherche sans résultat affiche un état vide au lieu d'une 404. Après une écriture, le serveur redirige en 303 vers la liste, donc rafraîchir la page ne rejoue plus l'action. Enfin, le formulaire du modal bascule tout seul entre création et édition : le script place l'identifiant dans l'URL et active le champ _method.

Vérifications

- 68 tests répartis en 5 suites, dont une nouvelle suite dédiée au dépôt ([depot.test.js (line 1)](/home/lionel/workgit/node/VoyageApp/tests/depot.test.js:1)) qui contrôle le tri, les filtres, l'attribution des identifiants, la persistance après rechargement, la reprise sur fichier corrompu et l'absence de fichier temporaire résiduel.
- Couverture : 98 % des lignes, 89 % des branches, 100 % des fonctions.
- 13 contrôles dans un vrai navigateur, dont un harnais qui charge le fichier JavaScript du projet et confirme que cliquer sur « modifier » vise bien /voyages/3 avec _method actif, que « ajouter » revient sur /voyages, et que l'apostrophe de « d'Ellis Island » survit au passage.

Points à connaître — les anciennes URL (/update, /delete/:id, /3, POST /search) n'existent plus ; les liens de la vue ont été mis à jour, mais d'éventuels favoris ou scripts externes sont à adapter. Les écritures sont volontairement synchrones, ce qui suffit largement pour huit voyages, et le commentaire d'en-tête du dépôt indique qu'il est le seul module à remplacer par SQLite si le volume grossit. Le fichier data/voyages.json est un état d'exécution, ignoré par git. Enfin, la section « Tests et qualité » de votre README annonce encore 96 % de couverture, chiffre daté de l'étape 3.

## Routes

| Verbe    | Chemin            | Rôle                                   |
| -------- | ----------------- | -------------------------------------- |
| `GET`    | `/` et `/voyages` | liste des voyages, filtrable par `?q=` |
| `POST`   | `/voyages`        | création d'un voyage                   |
| `GET`    | `/voyages/:id`    | détail d'un voyage                     |
| `PUT`    | `/voyages/:id`    | modification d'un voyage               |
| `DELETE` | `/voyages/:id`    | suppression d'un voyage                |

Les formulaires HTML ne savent envoyer que `GET` et `POST` : ils ajoutent un champ
caché `_method` que `middlewares/methodOverride.js` traduit en `PUT` ou `DELETE`.
Après une écriture, le serveur redirige vers la liste (motif Post/Redirect/Get),
ce qui évite qu'un rafraîchissement rejoue la modification.

## Organisation du code

```
app.js            point d'entrée : middlewares puis branchement des routes
routes/           déclaration des URL et des verbes HTTP
controllers/      orchestration : validation, appel du dépôt, choix de la vue
repositories/     accès aux données et persistance
validators/       règles de validation d'un voyage
middlewares/      jeton CSRF, méthode HTTP des formulaires
models/           jeu de données initial
views/            gabarits EJS
tests/            tests automatisés (jest + supertest)
```

Les voyages sont enregistrés dans `data/voyages.json`, créé au premier démarrage à
partir de `models/BaseVoyages.js` s'il n'existe pas. Ce fichier contient des données
d'exécution : il est ignoré par git.

# 16.09.2026 00:25 expérience utilisateur et accessibilité

Confort d'usage
La suppression demande désormais confirmation : chaque formulaire de carte porte l'attribut data-confirmation ([listVoyages.ejs (line 119)](/home/lionel/workgit/node/VoyageApp/views/listVoyages.ejs:119)) et un écouteur vérifie la réponse avant de laisser passer l'envoi ([listVoyages.js (line 62)](/home/lionel/workgit/node/VoyageApp/public/javascripts/listVoyages.js:62)). J'ai vérifié dans le navigateur qu'un refus bloque bien l'envoi et qu'une acceptation le laisse passer.

Chaque action laisse maintenant une trace : la redirection porte ?fait=creation|modification|suppression et la page affiche le message correspondant ([controllers/voyages.js (line 11)](/home/lionel/workgit/node/VoyageApp/controllers/voyages.js:11)). Un paramètre inconnu n'affiche rien, c'est testé.

L'entête n'est plus chargée en AJAX : elle est rendue par le serveur ([entete.ejs (line 1)](/home/lionel/workgit/node/VoyageApp/views/partials/entete.ejs:1)), ce qui supprime une requête, rend la page complète sans JavaScript et améliore l'indexation. Les fichiers public/html/entete.html et public/javascripts/entete.js ont disparu, et le menu passe en français.

Accessibilité — les boutons d'icône portent un libellé explicite (« Modifier le voyage à Rome », « Supprimer le voyage à Rome »), les icônes sont ignorées par les lecteurs d'écran, les images décrivent leur destination au lieu du générique « Card image cap », le titre de la fenêtre modale est correctement référencé (il pointait sur la fenêtre elle-même), et le <label> orphelin qui traînait dans chaque carte a été retiré.

Un vrai gain de sécurité au passage — les comportements passant désormais par des écouteurs et non plus par des attributs onclick, la politique de sécurité du contenu n'autorise plus le JavaScript en ligne ([app.js (line 30)](/home/lionel/workgit/node/VoyageApp/app.js:30)). C'était la limite signalée à l'étape 2.

Mise en page — grille responsive (une colonne sur mobile, deux sur tablette, trois sur ordinateur), cartes de hauteur égale, bouton de suppression correctement ancré, prix au format français (1 200 € au lieu de 1200 €), jQuery chargé une seule fois et avant Bootstrap. J'ai contrôlé le résultat en capture d'écran aux largeurs bureau et mobile.

Images indisponibles — en vérifiant le rendu, j'ai constaté que 4 des 8 adresses d'images (Londres, Séville, Porto et Lisbonne) renvoient une erreur 404. J'ai ajouté une vignette de repli « Image indisponible » ([listVoyages.js (line 76)](/home/lionel/workgit/node/VoyageApp/public/javascripts/listVoyages.js:76)), vérifiée avec de vraies réponses 404, qui remplace l'icône cassée du navigateur ; les images sont aussi recadrées plutôt qu'étirées. Remplacer ces quatre adresses par des visuels pérennes reste un travail de contenu.

Deux points pratiques : les messages d'action passent par l'URL, donc rafraîchir la page les réaffiche (c'est le compromis retenu pour éviter d'ajouter des sessions), et le dossier public/html est désormais vide.

## Confort d'usage et accessibilité

- la suppression demande toujours confirmation ;
- après un ajout, une modification ou une suppression, un message récapitule
  l'action (paramètre `?fait=` de la redirection) ;
- une recherche sans résultat affiche un message au lieu d'une page d'erreur ;
- les boutons d'icône portent un libellé (`aria-label`) et les icônes sont ignorées
  des lecteurs d'écran (`aria-hidden`) ;
- les images décrivent la destination, et l'entête est rendue par le serveur :
  la page est complète sans JavaScript.

## Intégration continue

Le fichier `.github/workflows/ci.yml` lance, à chaque envoi sur `main` et à chaque
demande de fusion, sur Node 18, 20 et 22 :

```
npm ci                 # installation à partir du fichier de verrouillage
npm run format:check   # formatage
npm run lint           # analyse statique
npm test               # tests
```

# 16.09.26 00:37 Dernières tâches de l'audit

Code mort — routes/module.js a disparu, ainsi que les deux exceptions qu'il fallait maintenir pour lui dans ESLint et Jest. En vérifiant, j'ai retrouvé un second vestige listé dans l'audit : views/index.ejs, jamais rendue par aucune route ; elle est supprimée aussi. J'ai confirmé qu'il ne reste aucune référence à l'un ou l'autre dans le projet.

Dépendances — boostrap (faute de frappe, jamais importé), fetch et node-fetch sont retirés, et nodemon est passé en devDependencies puisque c'est un outil de développement. J'ai ajouté un champ engines qui documente le Node 18.18 minimum, découvert à l'étape 3 quand ESLint 10 s'est révélé incompatible.

Sécurité des dépendances — npm audit signalait 5 vulnérabilités : une élevée (déni de service via brace-expansion) et quatre modérées (morgan et qs, ce dernier entraîné par Express). Toutes étaient corrigeables sans rupture, et le sont : morgan 1.12.1, express 4.22.3, qs 6.16.0, brace-expansion 5.0.12. npm audit ne signale plus rien.

Intégration continue — [ci.yml (line 1)](/home/lionel/workgit/node/VoyageApp/.github/workflows/ci.yml:1) se déclenche à chaque envoi sur main et à chaque demande de fusion, sur Node 18, 20 et 22, et enchaîne npm ci, la vérification du formatage, l'analyse statique puis les tests.

Écoute réseau — bin/www acceptait les connexions sur toutes les interfaces, même en développement. Il écoute maintenant sur 127.0.0.1 en développement et sur 0.0.0.0 en production, avec la variable HOST pour forcer l'un ou l'autre ([bin/www (line 15)](/home/lionel/workgit/node/VoyageApp/bin/www:15)). J'ai vérifié les trois cas en lançant le serveur : 127.0.0.1:3230 en développement, 0.0.0.0:3231 en production, et HOST=0.0.0.0 respecté en développement, chaque fois avec une réponse HTTP 200. Le devcontainer force HOST=0.0.0.0 pour que l'aperçu automatique continue de fonctionner.

Vérifications — j'ai commencé par rejouer npm ci, l'étape exacte de la CI : l'installation propre à partir du fichier de verrouillage fonctionne, puis formatage, lint et les 81 tests passent. Le YAML du workflow est valide et sa structure contrôlée (6 étapes). Je n'ai en revanche pas pu exécuter GitHub Actions ici, faute de runner : j'ai validé la syntaxe et rejoué ses étapes localement.

Deux points pratiques. Si votre conteneur mappe les ports au niveau Docker plutôt que via VS Code, il faudra mettre HOST=0.0.0.0 ; le devcontainer du dépôt le fait déjà. Et les modifications ne sont pas encore committées (10 fichiers modifiés, 2 supprimés, .github/ ajouté) — l'audit complet, désormais coché de bout en bout, se trouve dans [audit-voyageapp.md](/home/lionel/Documents/Codex/2026-09-15/comment-peut-on-am-liorer-ce/outputs/audit-voyageapp.md).
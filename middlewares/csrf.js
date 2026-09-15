/**
 * Protection CSRF sans dépendance externe.
 *
 * Le jeton est signé (HMAC-SHA256) et n'est pas stocké côté serveur : il contient
 * une valeur aléatoire, sa date de création et sa signature. Il est déposé dans
 * les vues via res.locals.csrfToken et renvoyé par le champ caché _csrf des
 * formulaires. Toute requête qui modifie l'état (tout sauf GET, HEAD, OPTIONS)
 * est refusée si le jeton est absent, mal signé ou périmé.
 *
 * Le secret est tiré au démarrage, ou fourni par la variable d'environnement
 * CSRF_SECRET (recommandé en production : sinon les jetons changent à chaque
 * redémarrage).
 */
const crypto = require('crypto');

const SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
const DUREE_VALIDITE = 2 * 60 * 60 * 1000; // 2 heures
const METHODES_SANS_EFFET = ['GET', 'HEAD', 'OPTIONS'];

function signer(valeur) {
  return crypto.createHmac('sha256', SECRET).update(valeur).digest('hex');
}

function creerJeton() {
  const valeur = crypto.randomBytes(16).toString('hex') + '.' + Date.now();
  return valeur + '.' + signer(valeur);
}

function jetonValide(jeton) {
  if (typeof jeton !== 'string') return false;

  const parties = jeton.split('.');
  if (parties.length !== 3) return false;

  const valeur = parties[0] + '.' + parties[1];
  const signature = Buffer.from(parties[2], 'hex');
  const signatureAttendue = Buffer.from(signer(valeur), 'hex');

  if (signature.length !== signatureAttendue.length) return false;
  if (!crypto.timingSafeEqual(signature, signatureAttendue)) return false;

  const age = Date.now() - parseInt(parties[1], 10);
  return age >= 0 && age < DUREE_VALIDITE;
}

module.exports = function csrf(options) {
  // Routes en lecture seule exemptées : elles ne modifient aucune donnée.
  const exemptees = (options && options.exemptions) || [];

  return function (req, res, next) {
    res.locals.csrfToken = creerJeton();

    if (METHODES_SANS_EFFET.indexOf(req.method) !== -1 || exemptees.indexOf(req.path) !== -1) {
      return next();
    }

    const jeton = (req.body && req.body._csrf) || req.get('x-csrf-token');

    if (!jetonValide(jeton)) {
      return res.status(403).send("Requête refusée : jeton CSRF manquant ou invalide.");
    }

    next();
  };
};

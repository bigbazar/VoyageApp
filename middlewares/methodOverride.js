/**
 * Permet aux formulaires HTML d'utiliser les verbes REST.
 *
 * Les navigateurs ne savent envoyer que GET et POST : les vues ajoutent donc un
 * champ caché _method, que ce middleware transforme en PUT, PATCH ou DELETE
 * avant l'analyse des routes. Le jeton CSRF reste exigé, la protection ne
 * dépend pas du verbe reçu.
 */
const METHODES_ACCEPTEES = ['PUT', 'PATCH', 'DELETE'];

module.exports = function methodOverride(req, res, next) {
  if (req.method === 'POST') {
    const demandee = (req.body && req.body._method) || req.get('x-http-method-override');
    const methode = String(demandee || '').toUpperCase();

    if (METHODES_ACCEPTEES.indexOf(methode) !== -1) req.method = methode;
  }

  next();
};

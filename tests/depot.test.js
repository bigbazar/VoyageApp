/**
 * Étape 4 : le dépôt gère les données et leur persistance, indépendamment du
 * routage et des vues.
 */
const fs = require('fs');
const path = require('path');
const { creerDepot, fichierTemporaire } = require('./aide');

describe('Dépôt des voyages', () => {
  test('crée le fichier de données à partir du jeu initial', () => {
    const chemin = fichierTemporaire('depot');
    const depot = creerDepot(chemin);

    expect(depot.lister()).toHaveLength(8);
    expect(depot.CHEMIN).toBe(chemin);
    expect(JSON.parse(fs.readFileSync(chemin, 'utf8'))).toHaveLength(8);
  });

  test('trie les voyages par destination', () => {
    const destinations = creerDepot()
      .lister()
      .map((voyage) => voyage.destination);
    const attendu = [...destinations].sort((a, b) => a.localeCompare(b, 'fr'));

    expect(destinations).toEqual(attendu);
  });

  test('filtre la recherche par destination, par pays ou par prix maximum', () => {
    const depot = creerDepot();

    expect(depot.lister({ recherche: 'porto' })).toHaveLength(1);
    expect(depot.lister({ recherche: 'Espagne' })).toHaveLength(2);
    expect(depot.lister({ recherche: '100' })).toHaveLength(2);
    expect(depot.lister({ recherche: 'zzz' })).toHaveLength(0);
    expect(depot.lister({ recherche: '' })).toHaveLength(8);
  });

  test('trouve un voyage par son identifiant', () => {
    const depot = creerDepot();

    expect(depot.trouver(3).destination).toBe('New-York');
    expect(depot.trouver('3').destination).toBe('New-York');
    expect(depot.trouver(999)).toBeNull();
  });

  test('crée un voyage avec le premier identifiant libre', () => {
    const depot = creerDepot();

    expect(depot.creer({ destination: 'Oslo', pays: 'Norvege', prix: 300, devise: '€' }).id).toBe(
      9,
    );
    depot.supprimer(1);
    expect(depot.creer({ destination: 'Turin', pays: 'Italie', prix: 90, devise: '€' }).id).toBe(
      10,
    );
  });

  test('modifie un voyage existant et signale un identifiant inconnu', () => {
    const depot = creerDepot();
    const modifie = depot.modifier(3, {
      destination: 'Bruxelles',
      pays: 'Belgique',
      prix: 180,
      devise: '€',
    });

    expect(modifie.id).toBe(3);
    expect(depot.trouver(3).destination).toBe('Bruxelles');
    expect(depot.modifier(999, { destination: 'X', pays: 'Y', prix: 1, devise: '€' })).toBeNull();
  });

  test('supprime un voyage et signale un identifiant inconnu', () => {
    const depot = creerDepot();

    expect(depot.supprimer(1)).toBe(true);
    expect(depot.trouver(1)).toBeNull();
    expect(depot.supprimer(1)).toBe(false);
  });

  test('les modifications sont conservées dans le fichier', () => {
    const chemin = fichierTemporaire('persistance');
    const depot = creerDepot(chemin);
    depot.creer({ destination: 'Oslo', pays: 'Norvege', prix: 300, devise: '€' });

    // Nouvelle instance : les données doivent venir du fichier, pas de la mémoire
    const autre = creerDepot(chemin);
    expect(autre.lister()).toHaveLength(9);
    expect(autre.lister().map((voyage) => voyage.destination)).toContain('Oslo');
  });

  test('repart du jeu initial si le fichier de données est illisible', () => {
    const chemin = fichierTemporaire('corrompu');
    fs.mkdirSync(path.dirname(chemin), { recursive: true });
    fs.writeFileSync(chemin, 'ceci n’est pas du JSON');

    const depot = creerDepot(chemin);
    expect(depot.lister()).toHaveLength(8);
    expect(() => JSON.parse(fs.readFileSync(chemin, 'utf8'))).not.toThrow();
  });

  test('ne laisse pas de fichier temporaire après une écriture', () => {
    const chemin = fichierTemporaire('atomique');
    const depot = creerDepot(chemin);
    depot.creer({ destination: 'Oslo', pays: 'Norvege', prix: 300, devise: '€' });

    expect(fs.existsSync(chemin + '.tmp')).toBe(false);
  });
});

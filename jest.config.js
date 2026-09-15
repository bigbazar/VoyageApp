/**
 * Configuration des tests (jest + supertest).
 *
 * Les tests démarrent l'application sur un port éphémère : aucun serveur
 * externe n'est nécessaire. Lancer avec : npm test
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'app.js',
    'routes/**/*.js',
    'controllers/**/*.js',
    'repositories/**/*.js',
    'middlewares/**/*.js',
    'validators/**/*.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/routes/module.js'],
  coverageDirectory: 'coverage',
};

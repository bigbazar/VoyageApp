/**
 * Configuration ESLint (format « flat config »).
 * Lancer avec : npm run lint
 */
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      // Ancien fichier de données jamais importé, à supprimer (voir audit)
      'routes/module.js',
    ],
  },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      // Les gestionnaires Express reçoivent next même lorsqu'ils ne l'utilisent pas
      'no-unused-vars': ['error', { argsIgnorePattern: '^next$' }],
    },
  },

  {
    // Code exécuté dans le navigateur (jQuery est chargé par la vue)
    files: ['public/javascripts/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser, $: 'readonly' },
    },
  },

  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },
];

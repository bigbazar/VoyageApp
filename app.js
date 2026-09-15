var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var voyagesRouter = require('./routes/voyages');
var csrf = require('./middlewares/csrf');
var methodOverride = require('./middlewares/methodOverride');

// Génération d'un fichier de configuration sur socket.js avec Swagger - Etape 1
// const swaggerAutogen = require('swagger-autogen')();
// const outputFile = './swagger_output.json';
// swaggerAutogen(outputFile, ['./app.js']);

var app = express();

// En-têtes de sécurité. La politique de sécurité du contenu est ajustée aux
// ressources réellement chargées par les vues (Bootstrap, jQuery, Font Awesome
// depuis des CDN). Le JavaScript en ligne est interdit : les comportements de la
// page sont branchés dans public/javascripts/listVoyages.js.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://code.jquery.com', 'https://cdn.jsdelivr.net'],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
        ],
        fontSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  }),
);

// Mise en place de la page de consultation Swagger - Etape 2 à décommenter quand étape 1 est terminée
// La documentation n'est exposée qu'en développement : swagger-ui-express est une
// devDependency, absente d'une installation de production. Pour l'ouvrir :
// NODE_ENV=development npm start, puis http://localhost:3000/docs
if (app.get('env') === 'development') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./swagger_output.json');
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Pas de journal de requêtes pendant les tests (jest définit JEST_WORKER_ID)
if (!process.env.JEST_WORKER_ID && process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Les formulaires HTML ne savent envoyer que GET et POST : le champ caché
// _method permet d'utiliser PUT et DELETE (routes REST des voyages).
app.use(methodOverride);

// Protection CSRF : toute requête qui modifie l'état doit porter un jeton valide.
app.use(csrf());

app.use('/', indexRouter);
app.use('/voyages', voyagesRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

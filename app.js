var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Génération d'un fichier de configuration sur socket.js avec Swagger - Etape 1
// const swaggerAutogen = require('swagger-autogen')();
// const outputFile = './swagger_output.json';
// swaggerAutogen(outputFile, ['./app.js']);

var app = express();

// Mise en place de la page de consultation Swagger - Etape 2 à décommenter quand étape 1 est terminée
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger_output.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

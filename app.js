#!/usr/bin/env node
/* app.js is the entry point to the application.
It’s where the application is defined and configured. */
var express = require('express');
var app = express();

var loggerHelper = require('./utils/loggerHelper');
loggerHelper.initiateLogger(app); // (loggerHelper.js)
var tagJson = {msg : 'APP', colors : ['green', 'inverse']};
function logger(tagJson) {return process.console.tag(tagJson).time().file()};
logger(tagJson).log("App Start Up");

// Load Global Properties
require('./globalProperties');
logger(tagJson).log(loggerHelper.createLogMessage('Validation Properties: ', validationProperties));

// Put DB util on process so it can be used from any script
var dbHelper = require('./utils/dbHelper');
process.dbHelper = dbHelper;

initiateApp(app);

var routeSources = {
  "routes" : [
    {"route":'./routes/index', "path":'/'},
    {"route":'./routes/flows', "path":'/api/flows'},
    {"route":'./routes/documents', "path":'/api/documents'}
  ]
} 
// Routes:
setRoutes(app, routeSources);

// development error handler. will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    logger(tagJson).error(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler. no stacktraces leaked to user
app.use(function(err, req, res, next) {

  logger(tagJson).log("App Err: " + JSON.stringify(err));

  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

function initiateApp(app){

  tagJson.msg = 'Initiate App';
  // view engine setup
  var path = require('path');
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  var bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  var cookieParser = require('cookie-parser');
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  initiateClientSession(app);

  process.on('uncaughtException', function (err) {
    logger(tagJson).log("Uncaught Exception: " + err + "\n" + err.stack);
  });
}

function initiateClientSession(app){

  tagJson.msg = 'Initiate Client Session';
  //var session = require('client-sessions');
  var session = require('express-session');
  var sessionProperies = {
    cookieName: 'session',
    secret: 'random_string_goes_here',
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: {
        expires: 30 * 60 * 1000
    }
  };
  logger(tagJson).log('initiateClientSession(app) Session Properies:\n\t'+
    JSON.stringify(sessionProperies));
  sessionProperies.secret = 'djvr83sia02kd0wq2';
  app.use(session(sessionProperies));
}

function setRoutes(app, routeSources){

  tagJson.msg = 'Set Routes';
  var logMessage = 'setRoutes(app) Routes:';
  var routes = routeSources.routes;
  for (var i = 0; i < routes.length; i++) {
    var item = routes[i];
    var route = item.route;
    var path = item.path;
    logMessage += ("\n\tPath=" + path + ', Route=' + route);
    var required = require(route);
    app.use(path, required);
  };
  logger(tagJson).log(logMessage);
}

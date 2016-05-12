var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var routes = require('./routes/index');
var users  = require('./routes/users');
var roles  = require('./routes/roles');
var mandates  = require('./routes/mandates');
var api = require('./routes/api');
var login = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public/', express.static(path.join(__dirname, 'public')));

app.use(session({
	saveUninitialized: true,
	resave: true,
	secret: 'temporarySuperSecretKey#¤%&'
}));
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);
app.use('/roles', roles);
app.use('/mandates', mandates);
app.use('/api', api)

app.use('/login', login);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: (app.get('env') === 'development') ? err : {}
  });
});

module.exports = app;

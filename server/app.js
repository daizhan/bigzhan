/**
 * app.js
 */

let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let CONSTANT = require('./config/const');

let configHelper = require('./config/config_helper');

let logger = require('./middleware/log');
let accessLogger = require('./middleware/log_access');

let errorHandler = require('./middleware/error');

let index = require('./routes/index');

let app = express();

app.set('trust proxy', 'loopback');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// init config
app.use(function (req, res, next) {
    let config = configHelper.getConfig('index');
    req.config = config;
    next();
});

// init logger
app.use(logger);

// init access logger
app.use(accessLogger);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('*', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let tips = 'Not Found';
    let err = new Error(tips);
    err.status = 404;
    err.tips = tips;
    next(err);
});

// error handler
app.use(errorHandler);

module.exports = app;

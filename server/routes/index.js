var express = require('express');
var helper = require('./helper');
let appRoute = require('./app');

function handler (req, res) {
    res.render('index', {
        title: 'bigzhan',
        csrfToken: req.session.csrfToken || '',
        csrfHeader: req.config.csrf.header || ''
    });
}

let routeOption = { rateLimit: { enable: false }, csrf: { enable: false, needSend: true } };
let routeList = [
    helper.route('/', 'get', appRoute, handler, routeOption)
];

var router = express.Router();

module.exports = helper.generateRoute(router, routeList);

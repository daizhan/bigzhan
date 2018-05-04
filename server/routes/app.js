let route = require('./helper').route;

let apiRoute = require('./api');

module.exports = [
    route('/api', 'get', apiRoute),
];

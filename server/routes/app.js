let route = require('./helper').route;

let apiRoute = require('./api');

module.exports = [
    route('/api', 'get', apiRoute),
    route('/test', 'get', [], function (req, res) {
        res.send('api router test');
    }),
];

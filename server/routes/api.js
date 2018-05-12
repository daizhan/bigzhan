let route = require('./helper').route;

let testHandler = require('../controller/test/index');

module.exports = [
    route('/test', 'get', [], testHandler.detail),
    route('/mysql', 'get', [], testHandler.mysql),
    route('/cache', 'get', [], testHandler.cache, {rateLimit: {enable: true, total: 5, expire: 30 * 1000}})
];

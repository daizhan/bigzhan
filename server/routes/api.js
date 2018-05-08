let route = require('./helper').route;

let testHandler = require('../controller/test/index');

module.exports = [
    route('/test', 'get', [], testHandler.detail),
    route('/mysql', 'get', [], testHandler.mysql)
];

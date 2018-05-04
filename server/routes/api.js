let route = require('./helper').route;

let testHandler = require('../controller/test');

module.exports = [
    route('/test', 'get', [], testHandler, {})
];

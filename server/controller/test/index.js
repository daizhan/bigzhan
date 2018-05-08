/**
 * demo for test module
 */

let BaseHandler = require('../base');

let moduleHandler = BaseHandler.extend();

let testHandler = new moduleHandler({moduleName: 'test'});

let apiList = [
    'detail', 'mysql'
];

module.exports = (function () {
    let handler = {};
    for (let api of apiList) {
        handler[api] = testHandler.action(api);
    }
    return handler;
})();

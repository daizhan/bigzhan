/**
 * 实用函数集合
 */

let filePath = require('./file_path');
let time = require('./time');
let env = require('./env');
let collections = require('./collections');
let escape = require('./escape');
let argCheck = require('./arg_check');
let secret = require('./secret');

module.exports = {
    argCheck: argCheck,
    filePath: filePath,
    time: time,
    env: env,
    collections: collections,
    escape: escape,
    secret: secret
};

/**
 * 实用函数集合
 */

let filePath = require('./file_path');
let time = require('./time');
let env = require('./env');
let collections = require('./collections');
let escape = require('./escape');
let storage = require('./storage');

module.exports = {
    filePath: filePath,
    time: time,
    env: env,
    collections: collections,
    escape: escape,
    storage: storage
};

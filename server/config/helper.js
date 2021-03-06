/**
 * 配置辅助对象
 */

let utils = require('../utils/index');
let path = require('path');

let Helper = {
    getConfig (configName, env) {
        let fileExtension = '.js';
        if (!configName.match(/\.js$/)) {
            configName += fileExtension;
        }
        let configFile = path.join(__dirname, configName);
        if (!utils.filePath.isFileExist(configFile)) {
            return null;
        }
        let config = require('./' + configName);
        let targetConfig = {};
        if (config.common) {
            utils.collections.extend(targetConfig, config.common);
        }
        if (!env) {
            env = utils.env.getType();
        }
        if (config[env]) {
            utils.collections.extend(targetConfig, config[env]);
        }
        return utils.collections.deepCopy(targetConfig);
    }
};

module.exports = Helper;

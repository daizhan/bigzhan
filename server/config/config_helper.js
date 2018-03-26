/**
 * 配置辅助对象
 */

let utils = require('../utils/index');

module.exports = {
    getConfig (configName, env) {
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
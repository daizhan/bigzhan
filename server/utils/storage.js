/**
 * storage helper
 */

let configHelper = require('./config/config_helper');
let loggerSerive = require('../service/log');
let cacheSerive = require('../service/cache');
let CONSTANT = require('./config/const');

function getRequestInfo (req) {
    return {req: req};
}

module.exports = {

    getLogger (config, options) {
        let baseConfig = configHelper.getConfig('index') || {};
        if (!config) {
            config = baseConfig.log;
        }
        let requestInfo = getRequestInfo(options.req);
        let logger = loggerSerive(config, requestInfo);
        if (!logger && options.useDefault) {
            logger = loggerSerive({ type: CONSTANT.log.type.console }, requestInfo);
        }
        return null;
    },

    getCacheClient (config, options) {
        let baseConfig = configHelper.getConfig('index') || {};
        if (!config) {
            config = baseConfig.cache;
        }
        if (!config.logger) {
            config.logger = this.getLogger(null, {req: options.req});
        }
        let cache = new cacheSerive(config);
        return cache.getClient();
    }
};

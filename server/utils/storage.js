/**
 * storage helper
 */

let loggerSerive = require('../service/log');
let cacheSerive = require('../service/cache');
let CONSTANT = require('../config/const');
let configHelper = require('../config/helper');

function getRequestInfo (req) {
    return {req: req};
}

module.exports = {

    printLog (level, logData, config=null, options={}) {
        let logger = this.getLogger(config, options);
        if (logger) {
            logger[level](logData);
        }
    },

    getLogger (config, options) {
        console.log(configHelper.getConfig);
        let baseConfig = configHelper.getConfig('index') || {};
        if (!config) {
            config = baseConfig.log;
        }
        let requestInfo = getRequestInfo(options.req);
        let logger = loggerSerive(config, requestInfo);
        if (!logger && options.useDefault) {
            logger = loggerSerive({ type: CONSTANT.log.type.console }, requestInfo);
        }
        return logger;
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

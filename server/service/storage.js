/**
 * storage service
 */

let loggerSerive = require('./log');
let cacheSerive = require('./cache');
let mysqlSerive = require('./mysql');
let CONSTANT = require('../config/const');
let configHelper = require('../config/helper');

function getRequestInfo (req) {
    return {req: req};
}

let cacheClient = {};
let dbClient = {};

function getCacheKey (config) {
    return `${config.host}-${config.port}-${config.password}`;
}

function getDbKey (config) {
    let key = `${config.host}-${config.port}-${config.user}-${config.password}-${config.database}`;
    if (config.pool && config.pool.enable) {
        key += '-pool';
    }
    return key;
}

module.exports = {

    printLog (level, logData, config=null, options={}) {
        let logger = this.getLogger(config, options);
        if (logger) {
            logger[level](logData);
        }
    },

    getLogger (config, options={}) {
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

    getCacheClient (config, options={}) {
        let baseConfig = configHelper.getConfig('index') || {};
        if (!config) {
            config = baseConfig.cache;
        }
        if (!config.logger) {
            config.logger = this.getLogger(null, {req: options.req});
        }
        let cache;
        let key = getCacheKey(config);
        if (!options.new && cacheClient[key]) {
            cache = cacheClient[key];
        } else {
            cache = new cacheSerive(config);
            cacheClient[key] = cache;
        }
        return cache.getClient();
    },

    getMysqlClient (config, options={}) {
        let baseConfig = configHelper.getConfig('index') || {};
        if (!config) {
            config = baseConfig.mysql;
        }
        if (!config.logger) {
            config.logger = this.getLogger(null, {req: options.req});
        }
        let mysql;
        let key = getDbKey(config);
        if (!options.new && dbClient[key]) {
            mysql = dbClient[key];
        } else {
            mysql = new mysqlSerive(config);
        }
        dbClient[key] = mysql;
        return mysql.getConnection();
    }
};

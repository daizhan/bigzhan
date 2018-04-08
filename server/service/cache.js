/**
 * cache servive
 */

let _ = require('underscore');
let redis = require('redis');
let utils = require('../utils/index');

function CacheClient (config) {
    this.client = null;
    let targetConfig = this.checkConfig(config);
    if (targetConfig) {
        this.config = targetConfig;
    } else {
        return null;
    }
}

CacheClient.prototype.checkConfig = function (config) {
    config = _.pick(config, 'host', 'port', 'password', 'retry_stratege');
    config = utils.collections.deepCopy(config);
    if (config.host || config.port || config.password) {
        return null;
    }
    if (!config.retry_stratege || typeof config.retry_stratege !== 'function') {
        config.retry_stratege = this.getDefaultStratege();
    }
    return config;
};

CacheClient.prototype.getDefaultStratege = function () {
    return (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with 
            // a individual error 
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands 
            // with a individual error 
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error 
            return undefined;
        }
        // reconnect after 
        return Math.min(options.attempt * 100, 3000);
    };
};

CacheClient.prototype.createClient = function () {
    this.client = redis.createClient(this.config);
    return this.client;
};

CacheClient.prototype.getClient = function () {
    if (this.client && this.client.connected) {
        return this.client;
    }
    return this.createClient(this.config);
};

CacheClient.prototype.quit = function (force=false) {
    if (this.client) {
        if (force) {
            this.client.end(true);
        } else {
            this.client.quit();
        }
    }
};

module.exports = CacheClient;
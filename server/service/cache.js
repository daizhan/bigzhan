/**
 * cache servive
 */

let _ = require('underscore');
let redis = require('redis');
let utils = require('../utils/index');

function CacheClient (config) {
    this.status = STATUS.disconnected;
    this.client = null;
    let targetConfig = this.checkConfig(config);
    if (targetConfig) {
        this.config = targetConfig;
    } else {
        return null;
    }
}

let STATUS = {
    disconnected: 'disconnected',
    connecting: 'connecting',
    connected: 'connected'
};

CacheClient.prototype.printLog = function (type, msg) {
    if (this.config.logger) {
        this.config.logger[type]('Redis log: ' + msg);
    } else {
        console.log('Redis log: ' + msg);
    }
};

CacheClient.prototype.checkConfig = function (config) {
    if (config.password) {
        config = _.pick(config, 'host', 'port', 'password', 'retry_stratege');
    } else {
        config = _.pick(config, 'host', 'port', 'retry_stratege');
    }
    config = utils.collections.deepCopy(config);
    if (!config.host || !config.port) {
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
            this.printLog('error', 'The server refused the connection');
            return undefined;
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands 
            // with a individual error 
            this.printLog('error', 'Retry time exhausted');
            return undefined;
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error 
            this.printLog('error', 'Retry too many times(>10)');
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    };
};

CacheClient.prototype.listenEvent = function (client) {
    client.on('error', (err) => {
        this.printLog('error', err);
        this.status = STATUS.disconnected;
    });

    client.on('connect', () => {
        this.printLog('log', 'connect to server');
        this.status = STATUS.connected;
    });

    client.on('reconnecting', () => {
        this.printLog('log', 'trying to reconnect to server');
        this.status = STATUS.connecting;
    });
};

CacheClient.prototype.createClient = function () {
    if (this.client) {
        return this.client;
    }
    this.status = STATUS.connecting;
    this.client = redis.createClient(this.config);
    this.listenEvent(this.client);
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

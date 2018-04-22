import { CANCELLED } from 'dns';

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

let STATUS = {
    disconnected: 'disconnected',
    connecting: 'connecting',
    connected: 'connected'
};

let CLIENT = {
    instance: null,
    status: STATUS.disconnected
};


CacheClient.prototype.printLog = function (type, msg) {
    if (this.config.logger) {
        this.config.logger[type]('Redis log: ' + msg);
    } else {
        console.log('Redis log: ' + msg);
    }
};

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
    client.on('error', function (err) {
        this.printLog('error', 'Error ' + err);
    });

    client.on('connect', function () {
        this.printLog('log', 'connect to server');
        CLIENT.status = STATUS.connected;
    });

    client.on('reconnecting', function () {
        this.printLog('log', 'trying to reconnect to server');
        CLIENT.status = STATUS.disconnected;
    });
};

CacheClient.prototype.createClient = function () {
    let client = CLIENT.instance;
    if (client && client.connected) {
        return client;
    } else if (CLIENT.status === STATUS.connecting) {
        return client;
    }
    this.quit(true);
    CLIENT.instance = redis.createClient(this.config);
    CLIENT.status = STATUS.connecting;
    return CLIENT.instance;
};

CacheClient.prototype.getClient = function () {
    let client = CLIENT.instance;
    if (client && client.connected) {
        return client;
    }
    return this.createClient(this.config);
};

CacheClient.prototype.quit = function (force=false) {
    let client = CLIENT.instance;
    if (client) {
        if (force) {
            client.end(true);
        } else {
            client.quit();
        }
    }
};

module.exports = CacheClient;

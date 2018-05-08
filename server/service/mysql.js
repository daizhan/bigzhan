/**
 * cache servive
 */

let _ = require('underscore');
let mysql = require('mysql');
let utils = require('../utils/index');

let STATUS = {
    connecting: 'connecting',
    connected: 'connected',
    disconnected: 'disconnected'
};

function MysqlClient (config) {
    this.status = STATUS.disconnected;
    this.connection = null;
    let targetConfig = this.checkConfig(config);
    if (targetConfig) {
        this.config = targetConfig;
    } else {
        return null;
    }
}

MysqlClient.prototype.printLog = function (type, msg) {
    if (this.config.logger) {
        this.config.logger[type]('mysql log: ' + msg);
    } else {
        console.log('mysql log: ' + msg);
    }
};

MysqlClient.prototype.checkConfig = function (config) {
    config = _.pick(config, 'host', 'port', 'user', 'password', 'database');
    config = utils.collections.deepCopy(config);
    if (!config.host || !config.port || !config.user || !config.password || !config.database) {
        return null;
    }
    return config;
};

MysqlClient.prototype.createConnection = function () {
    this.connection = mysql.createConnection(this.config);
    this.status = STATUS.connecting;
    this.connection.connect((err) => {
        if (err) {
            this.status = STATUS.disconnected;
            this.printLog('error connecting: ' + err.stack);
        } else {
            this.status = STATUS.connected;
            this.printLog('connected as id ' + this.connection.threadId);
        }
    });
    return this.connection;
};

MysqlClient.prototype.getConnection = function () {
    if (this.STATUS === STATUS.connected || this.STATUS === STATUS.connecting) {
        return this.connection;
    } else {
        return this.createConnection();
    }
};

MysqlClient.prototype.quit = function (options={}) {
    if (options.force) {
        return this.connection.destroy();
    }
    if (typeof options.callback === 'function') {
        return this.connection.end(options.callback);
    }
    return this.connection.end();
};

module.exports = MysqlClient;

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
    this.usePool = false;
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
        console.log(type, 'mysql log: ' + msg);
    }
};

MysqlClient.prototype.checkConfig = function (config) {
    let poolConfig = config.pool;
    config = _.pick(config, 'host', 'port', 'user', 'password', 'database', 'debug');
    config = utils.collections.deepCopy(config);
    if (!config.host || !config.port || !config.user || !config.password || !config.database) {
        return null;
    }
    if (poolConfig && poolConfig.enable) {
        this.usePool = true;
        poolConfig = _.pick(poolConfig, 'acquireTimeout', 'waitForConnections', 'connectionLimit', 'queueLimit');
    }
    return _.extend({}, config, poolConfig || {});
};

MysqlClient.prototype.createConnection = function () {
    if (this.usePool) {
        return this.createPoolConnection(this.config);
    }
    this.connection = mysql.createConnection(this.config);
    this.status = STATUS.connecting;
    this.connection.connect((err) => {
        if (err) {
            this.status = STATUS.disconnected;
            this.printLog('error', 'error connecting: ' + err.stack);
        } else {
            this.status = STATUS.connected;
            this.printLog('info', 'connected as id ' + this.connection.threadId);
        }
    });
    return this.connection;
};

MysqlClient.prototype.createPoolConnection = function (config) {
    this.connection = mysql.createPool(config);
    this.status = STATUS.connecting;
    this.connection.on('connection', (connection) => {
        this.status = STATUS.connected;
        this.printLog('info', 'pool connected as id ' + connection.threadId);
    });
    this.connection.on('acquire', (connection) => {
        this.printLog('info', 'pool acquire event for connnection' + connection.threadId);
    });
    this.connection.on('enqueue', () => {
        this.printLog('info', 'pool enqueue event');
    });
    this.connection.on('release', (connection) => {
        this.printLog('info', 'pool release event for connection ' + connection.threadId);
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
    this.status = STATUS.disconnected;
    if (!this.usePool && options.force) {
        return this.connection.destroy();
    }
    if (typeof options.callback === 'function') {
        return this.connection.end(options.callback);
    }
    return this.connection.end();
};

module.exports = MysqlClient;

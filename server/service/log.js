/**
 * logger service
 */

let winston = require('winston');
let _ = require('underscore');
let path = require('path');
let os = require('os');

const CONSTANT = require('../config/const');
let utils = require('../utils/index');

const TYPES = {
    console: CONSTANT.log.type.console,
    file: CONSTANT.log.type.file
};

const CUT_STYLE = {
    day: CONSTANT.log.cutStyle.day,
    hour: CONSTANT.log.cutStyle.hour
};

function formatter (data, options) {
    let lines = [];
    let title = `[${utils.time.format(new Date(), '%Y-%m-%d %H:%M:%S')} - ${options.level.toUpperCase()}]`;
    if (options.req) {
        title += ` - ${options.req.path || ''}`;
    }
    lines.push(title);
    if (options.message) {
        lines.push(options.message);
    }
    if (options.meta && Object.keys(options.meta).length) {
        _.each(options.meta, function (value, key) {
            lines.push(`${key}: ${JSON.stringify(value)}`);
        });
    }
    lines.push('--------------');
    return lines.join(os.EOL);
}

function checkConfig (config) {
    if (!config || !~Object.keys(TYPES).indexOf(config.type)) { // 没有配置，或者类型不对
        return false;
    }
    if (config.type === TYPES.file) {
        if (!config.logPath && !config.defaultFilename) { // 没有提供日志路径
            return false;
        }
        if (config.cutStyle && !~Object.keys(CUT_STYLE).indexOf(config.cutStyle)) { // 日志切割类型不对
            return false;
        }
    }
    return true;
}

function getConfig (config) {
    let loggerConfig = _.extend({}, config);
    if (config.type === TYPES.file) {
        if (!config.logPath) {
            loggerConfig.logPath = path.dirname(__dirname);
        }
        utils.filePath.createPath(loggerConfig.logPath);
        if (!config.cutStyle) {
            loggerConfig.cutStyle = CUT_STYLE.day;
        }
    }
    return loggerConfig;
}

function getLogFileName (type) {
    let format;
    let time = new Date();
    if (type === CUT_STYLE.day) {
        format = '%Y-%m-%d';
    } else {
        format = '%Y%m%d_%H%M%S';
    }
    return utils.time.format(time, format + '.log');
}

function Logger (config, options) {
    let transports = [];
    let passed = checkConfig(config);
    if (!passed) {
        return null;
    }
    config = getConfig(config);
    if (config.type === TYPES.console) {
        transports.push(new (winston.transports.Console)({
            name: CONSTANT.log.type.console,
            formatter: (data) => {
                return formatter(data, options);
            }
        }));
    } else {
        transports.push(new (winston.transports.File)({
            name: CONSTANT.log.type.file,
            json: false,
            formatter: (data) => {
                return formatter(data, options);
            },
            filename: path.join(config.logPath, getLogFileName(config.cutStyle))
        }));
    }
    return new (winston.Logger)({
        transports: transports
    });
}

module.exports = Logger;

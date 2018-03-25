/**
 * logger service
 */

let winston = require('winston');
let _ = require('underscore');
let path = require('path');

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

function formatter (options) {
    let lines = [`[ ${utils.time.format(new Date(), '%Y-%m-%d %H:%M:%S')} - ${options.level.toUpperCase()}]`];
    if (options.message) {
        lines.push(options.message);
    }
    if (options.meta) {
        lines.push(JSON.stringify(options.meta));
    }
    lines.push('--------------');
    return lines.join('\n');
}

function checkConfig (config) {
    if (!config || !~Object.keys(TYPES).indexOf(config.type)) { // 没有配置，或者类型不对
        return false;
    }
    if (config.type === TYPES.file) {
        if (!config.logPath && !config.defaultFilename) { // 没有提供日志路径
            return false;
        }
        if (config.cutStyle && ~!Object.keys(CUT_STYLE).indexOf(config.cutStyle)) { // 日志切割类型不对
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

function Logger (config) {
    let transports = [];
    let passed = checkConfig(config);
    if (!passed) {
        return null;
    }
    config = getConfig(config);
    if (config.type === TYPES.console) {
        transports.push(new (winston.transports.Console)({
            formatter: formatter
        }));
    } else {
        transports.push(new (winston.transports.File)({
            json: false,
            formatter: formatter,
            filename: path.join(config.logPath + getLogFileName(config.cutStyle))
        }));
    }
    return new (winston.Logger)({
        transports: transports
    });
}

module.exports = Logger;

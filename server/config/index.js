/**
 * 基础配置
 */

let CONSTANT = require('./const');

let config = {
    common: {
        log: {
            type: CONSTANT.log.type.file,
            logPath: '/home/daizhan/data/bigzhan.com/logs',
            cutStyle: CONSTANT.log.cutStyle.day
        }
    },
    production: {
        env: {
            label: CONSTANT.env.label.prd
        }
    },
    development: {
        env: {
            label: CONSTANT.env.label.dev
        }
    }
};

module.exports = config;

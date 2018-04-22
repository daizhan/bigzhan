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
        },
        cache: {
            host: 'localhost',
            port: 6379,
            password: ''
        },
        session: {
            name: 'sid',
            secret: ''
        }
    },
    production: {
        env: {
            label: CONSTANT.env.label.prd
        },
        session: {
            name: 'p_sid',
            secret: ''
        }
    },
    development: {
        env: {
            label: CONSTANT.env.label.dev
        },
        log: {
            type: CONSTANT.log.type.console
        },
        session: {
            name: 'd_sid',
            secret: ''
        }
    }
};

module.exports = config;

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
            secret: '0f6bd1b49de41930'
        }
    },
    production: {
        env: {
            label: CONSTANT.env.label.prd
        },
        session: {
            name: 'p_sid',
            secret: 'c333f55ac610c0e5'
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
            secret: 'e7184deccda6cf68'
        }
    }
};

module.exports = config;

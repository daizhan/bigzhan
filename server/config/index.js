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
        },
        csrf: {
            enable: true,
            header: 'CSRF',
            checkMethod: ['post', 'get']
        },
        rateLimit: {
            enable: true,
            total: 100,
            expire: 60 * 1000
        }
    },
    production: {
        env: {
            label: CONSTANT.env.label.prd
        },
        session: {
            name: 'p_sid',
            secret: 'c333f55ac610c0e5'
        },
        csrf: {
            header: 'PRD-CSRF'
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
        },
        csrf: {
            header: 'DEV-CSRF'
        }
    }
};

module.exports = config;

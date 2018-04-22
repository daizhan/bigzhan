/**
 * 错误码配置文件,
 * 第一位:
 *      1 前端
 *      2 node
 * 第二三位:
 *      00 公共
 *      01 redis
 *      02 mysql
 *      03 session
 *      04 log
 *      05 登录
 */

module.exports = {
    ERROR: {
        code: 10000000,
        msg: '服务异常',
        error: '未知的服务异常'
    },
    UNKNOWN_ERROR: {
        code: 10000001,
        msg: '服务异常',
        error: '未知的服务异常'
    },
    PAGE_NOT_FOUND: {
        code: 10000002,
        msg: 'Not Found',
        error: '404 错误'
    },
    SESSION_NO_CACHE_CLIENT: {
        code: 20300001,
        msg: '服务异常',
        error: 'session cache is not set!'
    },
    SESSION_NO_NAME: {
        code: 20300002,
        msg: '服务异常',
        error: 'session name is not set!'
    },
    SESSION_CANNOT_SET: {
        code: 20300003,
        msg: '服务异常',
        error: 'session can not set!'
    }
};

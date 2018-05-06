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
 *      06 请求
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
    REQUEST_RATE_LIMITED: {
        code: 10000003,
        msg: '请求太快，请稍后再试！',
        error: 'request too many times during the time'
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
    },
    REQ_API_NOT_FOUND: {
        code: 20600001,
        msg: '请求的接口不存在',
        error: 'api not found'
    },
    REQ_ARG_ERROR: {
        code: 20600002,
        msg: '接口请求参数错误',
        error: 'api request arguments error'
    },
    REQ_UNSUPPORTED_API: {
        code: 20600003,
        msg: '请求的接口不受支持',
        error: 'api found but not supported'
    }
};

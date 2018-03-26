/**
 * 访问日志中间件
 */

let os = require('os');

let CONSTANT = require('../config/const');

let accessLogger = require('morgan');

accessLogger.token('protocol', function getProtocol (req) {
    return req.protocol.toUpperCase();
});

accessLogger.token('resMsg', function getProtocol (req) {
    return req.responseMsg ? os.EOL + req.responseMsg : '';
});

module.exports = function (req, res, next) {
    let logStream = {
        req: req,
        res: res,
        next: next,
        write: function (line) {
            let logger = this.req.logger;
            if (logger) {
                logger.info(line);
            }
            // 不是正式环境，并且没有logger或者logger 不是console类型
            if (this.req.config.env.label !== CONSTANT.env.label.prd && (!logger || !logger.transports[CONSTANT.log.type.console])) {
                console.log(line);
            }
        }
    };

    (accessLogger(
        ':remote-addr :method :url :protocol/:http-version :status :res[content-length] - :response-time ms :resMsg.',
        {
            stream: logStream,
        }
    ))(req, res, next);
};
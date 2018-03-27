/**
 * log middleware, for common log use
 */

let loggerSerive = require('../service/log');
let CONSTANT = require('../config/const');

module.exports = function (req, res, next) {
    function getRequestInfo (req) {
        return {req: req};
    }

    let requestInfo = getRequestInfo(req);
    let logger = loggerSerive(req.config.log, requestInfo);
    if (logger) {
        req.logger = logger;
    } else {
        req.logger = loggerSerive({ type: CONSTANT.log.type.console }, requestInfo);
    }
    next();
};
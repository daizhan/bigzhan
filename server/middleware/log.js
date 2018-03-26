/**
 * log middleware, for common log use
 */

let loggerSerive = require('../service/log');
let CONSTANT = require('../config/const');

module.exports = function (req, res, next) {
    let logger = loggerSerive(req.config.log);
    if (logger) {
        req.logger = logger;
    } else {
        req.logger = loggerSerive({ type: CONSTANT.log.type.console });
    }
    next();
};
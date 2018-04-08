/**
 * 错误处理中间件
 */

let os = require('os');
let errCode = require('../config/error_code');
let CONSTANT = require('../config/const');
let _ = require('underscore');

module.exports = function (err, req, res, next) {
    let isPrd = req.config.env.label === CONSTANT.env.label.prd;
    let status = err.status || 500;

    res.locals.status = status;
    res.locals.isPrd = isPrd;
    res.locals.message = err.message;
    res.locals.tips = err.tips || 'Oh no something\'s wrong';
    res.locals.error = isPrd ? {} : err;

    req.logger.error(
        status + ' - ' + err.stack
    );

    res.status(status);
    res.format({
        html: () => {
            res.render('error');
        },
        json: () => {
            if (isPrd) {
                if (status === 404) {
                    res.error(errCode.PAGE_NOT_FOUND);
                } else {
                    res.error(errCode.UNKNOWN_ERROR);
                }
            } else {
                res.error(null, _.pick(err, 'message', 'stack'));
            }
        }
    });
};
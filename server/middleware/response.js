/**
 * 添加自定义的输出方法
 */

let _ = require('underscore');
let errCode = require('../config/error_code');
let utils = require('../utils/index');

module.exports = function (req, res, next) {
    let helper = {
        log: function (response) {
            let data = {
                query: req.query,
                body: req.body,
                response: response
            };
            req.logger.info(data);
        },
        render: function (body, options={}) {
            if (typeof options.needLog === 'undefined' || options.needLog) {
                this.log(body);
            }
            return res.json(utils.escape.escapeHTML(body));
        },
        json: function (body, options={}) {
            let response = { code: 0, msg: 'Ok' };
            if (options.key) {
                response = _.extend(response, _.pick(errCode[options.key] || errCode.ERROR, 'code', 'msg'));
            }
            _.extend(response, _.pick(options, 'msg', 'code'));
            response.data = body;
            return this.render(response, {needLog: options.needLog});
        },
        error: function (errorInfo, options={}) {
            let response = {
                code: -1,
                msg: 'error'
            };
            if (errorInfo) {
                if (typeof errorInfo === 'string') {
                    _.extend(response, _.pick(errCode[errorInfo] || errCode.ERROR, 'code', 'msg'));
                } else if (typeof errorInfo === 'object') {
                    _.extend(response, _.pick(errorInfo, 'code', 'msg'));
                }
            }
            _.extend(response, _.pick(options, 'code', 'msg'));
            response.data = options.data || {};

            return this.render(response, {isError: true, needLog: options.needLog});
        }
    };

    res.customJson = function (body, options={}) {
        return helper.json(body, options);
    };
    res.error = function (key, options={}) {
        return helper.error(key, options);
    };
    next();
};



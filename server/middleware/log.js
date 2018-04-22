/**
 * log middleware, for common log use
 */

let utils = require('../utils/index');

module.exports = function (req, res, next) {
    req.logger = utils.storage.getLogger(null, {req: req, useDefault: true});
    next();
};

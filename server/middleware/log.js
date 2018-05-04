/**
 * log middleware, for common log use
 */

let storageService = require('../service/storage');

module.exports = function (req, res, next) {
    req.logger = storageService.getLogger(null, {req: req, useDefault: true});
    next();
};

let _ = require('underscore');
let utils = require('../utils/index');
let storageService = require('../service/storage');

let tokenHelper = {
    needCheckCsrfToken (req, config) {
        if (!config.enable) {
            return false;
        } else if (config.checkMethod.indexOf(req.method.toLowerCase()) === -1) {
            return false;
        } else if (typeof config.validator === 'function') {
            return config.validator(req);
        }
        return true;
    },

    createToken (config) {
        return utils.secret.cryptoText('' + Date.now() + '' + Math.random() + config.salt);
    },

    updateToken (req, token) {
        req.session.csrfToken = token;
    },

    sendToken (req, res, config) {
        if (!req.session.csrfToken) {
            let token = this.createToken(config);
            this.updateToken(req, token);
            res.append(config.header, token);
        }
    },

    isTokenMatch (req, config) {
        let token = req.get(config.header);
        return token === req.session.csrfToken;
    },

    filterConfig (config) {
        let defaultConfig = {
            header: 'CSRF',
            salt: '15f83bfaf57ccaf9',
            checkMethod: ['post'],
            enable: true
        };
        config = config || {};
        return _.extend({},
            defaultConfig,
            _.pick.apply(_, [config].concat(Object.keys(defaultConfig)))
        );
    }
};

module.exports = function (config) {

    config = utils.collections.deepCopy(config);

    return (req, res, next) => {
        let csrfConfig = tokenHelper.filterConfig(config);

        if (tokenHelper.needCheckCsrfToken(req, csrfConfig)) {
            if (!tokenHelper.isTokenMatch(req, csrfConfig)) {
                if (typeof config.callback === 'function') {
                    return config.callback(req, res, csrfConfig);
                } else {
                    let msg = '[Security Error] csrf token not match!';
                    storageService.printLog('error', msg, null, {req: req});
                    return res.status(403).send(msg);
                }
            }
        }

        tokenHelper.sendToken(req, res);
        next();
    };
};

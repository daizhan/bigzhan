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
        let token = req.session.csrfToken;
        if (!token) {
            token = this.createToken(config);
            this.updateToken(req, token);
        }
        let headerToken = req.get(config.header);
        let cookieToken = req.signedCookies[config.header];
        if (!headerToken) {
            res.append(config.header, token);
        }
        if (!cookieToken) {
            res.cookie(config.header, token, { path: '/', signed: true, httpOnly: true });
        }
    },

    isTokenMatch (req, config) {
        let targetToken = req.session.csrfToken;
        let headerToken = req.get(config.header);
        let cookieToken = req.signedCookies[config.header];
        return headerToken === targetToken || cookieToken === targetToken;
    },

    filterConfig (config) {
        let defaultConfig = {
            header: 'CSRF',
            salt: '15f83bfaf57ccaf9',
            checkMethod: ['post'],
            enable: true,
            needSend: false,
            validator: null,
            callback: null
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

        if (csrfConfig.needSend) {
            tokenHelper.sendToken(req, res, csrfConfig);
        }
        next();
    };
};

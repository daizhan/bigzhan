let _ = require('underscore');
let utils = require('../utils/index');
let storageService = require('../service/storage');

module.exports = function (req, res, next) {

    function isInWhiteList (url, whiteList) {
        for (var key in whiteList) {
            if (whiteList.hasOwnProperty(key)) {
                let reg = new RegExp('^' + whiteList[key] + '?$');
                if (reg.test(url)) {
                    return true;
                }
            }
        }
        return false;
    }

    function createToken () {
        return utils.secret.cryptoText('' + Date.now() + '' + Math.random() + csrfTokenConfig.salt);
    }

    function updateToken (req, token) {
        req.session.csrfToken = token;
    }

    function sendToken (req, res, force) {
        if (!req.session.csrfToken || !!force) {
            let token = createToken();
            updateToken(req, token);
            res.append(csrfTokenConfig.header, token);
        }
    }

    function isTokenMatch (req, token) {
        if (!token) {
            token = req.get(csrfTokenConfig.header);
        }
        return token === req.session.csrfToken;
    }

    function filterConfig (config) {
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

    let csrfTokenConfig = filterConfig(req.config.csrf);
    let whiteList = {
        index: '/'
    };

    if (!csrfTokenConfig.enable) {
        next();
        return;
    }
    if (isInWhiteList(req.path, whiteList)) {
        sendToken(req, res);
        next();
        return;
    }
    if (csrfTokenConfig.checkMethod.indexOf(req.method.toLowerCase()) !== -1) {
        if (!isTokenMatch(req)) {
            let msg = '[Security Error] csrf token not match!';
            storageService.printLog('error', msg, null, {req: req});
            res.status(403);
            res.send(msg);
            return;
        }
    }

    next();

};

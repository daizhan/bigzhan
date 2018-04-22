/**
 * session middleware
 */

var Session = require('express-session');
var SessionStore = require('connect-redis')(Session);

var utils = require('../utils/index');
let configHelper = require('../config/config_helper');

function initSessionMiddleware (options) {

    let cacheClient = utils.storage.getCacheClient(null, {req: options.req});

    let data = {
        middleware: null,
        cacheClient: cacheClient,
        sessionName: options.sessionName
    };

    if (!cacheClient || !options.sessionName) {
        return data;
    }

    var sessionMiddleware = Session({
        name: options.sessionName,
        cookie: {},
        resave: false,
        store: new SessionStore({client: cacheClient}),
        saveUninitialized: false,
        secret: options.secret,
        unset: 'destroy'
    });
    data.middleware = sessionMiddleware;
    return data;
}

module.exports = () => {

    let config = configHelper.getConfig('index');
    let info = initSessionMiddleware({sessionName: config.session.name});

    if (!info.middleware) {
        return function (req, res) {
            if (!info.cacheClient) {
                return res.error('SESSION_NO_CACHE_CLIENT');
            }
            if (!info.sessionName) {
                return res.error('SESSION_NO_NAME');
            }
        };
    }

    let sessionMiddleware = info.middleware;

    return function (req, res, next) {
        let retry = 10;
        function lookupSession (error) {
            if (error) {
                return next(error);
            }
            retry -= 1;
            if (!req.session) {
                if (retry > 0) {
                    return sessionMiddleware(req, res, lookupSession);
                } else {
                    return res.error('SESSION_CANNOT_SET');
                }
            }
            next();
        }
        sessionMiddleware(req, res, lookupSession);
    };
};

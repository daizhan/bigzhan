let _ = require('underscore');
let storageService = require('../service/storage');
let configHelper = require('../config/helper');
let baseConfig = configHelper.getConfig('index');

var HTTP_VERBS = [
    'all',
    'get',
    'post',
    'put',
    'head',
    'delete',
    'options',
    'trace',
    'copy',
    'lock',
    'mkcol',
    'move',
    'purge',
    'propfind',
    'proppatch',
    'unlock',
    'report',
    'mkactivity',
    'checkout',
    'merge',
    'm-search',
    'notify',
    'subscribe',
    'unsubscribe',
    'patch',
    'search',
    'connect'
];

let CALLBACK_TYPES = {
    func: 'function',
    array: 'array',
    obj: 'object'
};

var Helper = {
    checkMethod: function (method) {
        var defaultMethod = 'get';
        if (typeof method == 'undefined') {
            return defaultMethod;
        }
        if (!~HTTP_VERBS.indexOf(method)) {
            return defaultMethod;
        } else {
            return method;
        }
    },
    concatUrl: function (...urls) {
        var urlPart = [];
        for (let url of urls) {
            url = url.replace(/(^\/+)|(\/+$)/g, '');
            if (url) {
                urlPart.push(url);
            }
        }
        return '/' + urlPart.join('/');
    },
    checkRateLimiter: function (router, options) {
        let limiter = this.createRateLimiter(router);
        if (!limiter) {
            return null;
        }
        let rateLimiter = (config) => {
            return limiter({
                method: 'all',
                lookup: ['sessionID'],
                total: config.total,
                expire: config.expire,
                onRateLimited: (req, res) => {
                    res.status(429);
                    res.error(config.tips || 'REQUEST_RATE_LIMITED');
                }
            });
        };
        let rateLimitConfig = _.pick(baseConfig.rateLimit, 'total', 'expire', 'enable');
        if (options.rateLimit) {
            rateLimitConfig = _.extend(rateLimitConfig, _.pick(options.rateLimit, 'total', 'expire', 'enable'));
        }
        if (rateLimitConfig.enable && rateLimitConfig.total && rateLimitConfig.expire) {
            return rateLimiter(rateLimitConfig);
        }
        return null;
    },
    mergeCallback: function (handlers, ...middlewares) {
        let callbacks = [];
        for (let item of middlewares) {
            if (typeof item === 'function') {
                callbacks.push(item);
            }
        }
        let type = this.getCallbackType(handlers);
        if (type !== CALLBACK_TYPES.array) {
            handlers = [handlers];
        }
        for (let item of handlers) {
            let type = this.getCallbackType(item);
            if (type === CALLBACK_TYPES.func) {
                callbacks.push(item);
            } else if (type === CALLBACK_TYPES.obj && typeof item.handler === CALLBACK_TYPES.func) {
                callbacks.push(item.handler);
            }
        }
        return callbacks;
    },
    createRateLimiter: function (router) {
        if (typeof this.limiter !== 'undefined') { // 定义过
            return this.limiter;
        }
        if (!baseConfig.rateLimit || !baseConfig.rateLimit.enable) {
            this.limiter = null;
            return this.limiter;
        }
        let cacheClient = storageService.getCacheClient();
        if (cacheClient) {
            this.limiter = require('../middleware/rate_limit')(router, cacheClient);
        } else {
            this.limiter = null;
        }
        return this.limiter;
    },

    getCallbackType (callback) {
        if (!callback) {
            return '';
        }
        if (typeof callback === CALLBACK_TYPES.func) {
            return CALLBACK_TYPES.func;
        } else if (typeof callback === CALLBACK_TYPES.obj) {
            if (Array.isArray(callback)) {
                if (callback.length) {
                    return CALLBACK_TYPES.array;
                } else {
                    return '';
                }
            } else {
                return CALLBACK_TYPES.obj;
            }
        }
        return '';
    },

    getCallbackObj (callback) {
        let type = this.getCallbackType(callback);
        if (type === CALLBACK_TYPES.func) {
            return {
                handler: callback,
                name: '',
                inherit: false
            };
        } else if (type === CALLBACK_TYPES.obj) {
            return _.pick(callback, 'handler', 'name', 'inherit');
        } else {
            return null;
        }
    },

    getCurrentCallback (callback) {
        let callbacks = [];
        let type = this.getCallbackType(callback);
        if (type) {
            if (type !== CALLBACK_TYPES.array) {
                callback = [callback];
            }
            for (let item of callback) {
                let callbackObj = this.getCallbackObj(item);
                if (callbackObj) {
                    callbacks.push(callbackObj);
                }
            }
        }
        return callbacks;
    },

    getAllCallback (currentCallback, parentCallback=[]) {
        let callbacks = [];
        if (Array.isArray(parentCallback)) {
            callbacks = parentCallback.slice(0);
        }
        callbacks = callbacks.concat(currentCallback);
        return callbacks;
    },

    getInheritedCallback (currentCallback, parentCallback=[]) {
        let callbacks = [];
        if (Array.isArray(parentCallback)) {
            callbacks = parentCallback.slice(0);
        }
        for (let item of currentCallback) {
            if (item.name && item.inherit) {
                callbacks.push(item);
            }
        }
        return callbacks;
    },

    getInheritOptions (options) {
        let inheritOptions = [];
        if (!Array.isArray(options)) {
            options = [options];
        }
        for (let item of options) {
            if (typeof item === 'string') {
                inheritOptions.push(item);
            }
        }
        return inheritOptions;
    },

    filterInheritedCallback (callback, options) {
        let inheritedCallbacks = [];
        let inheritOptions = [];
        let isExcludeByOption = false;
        let isInheriteByOption = false;
        if (options.inheritList) {
            isInheriteByOption = true;
            inheritOptions = this.getInheritOptions(options.inheritList);
        } else if (options.excludeList) {
            isExcludeByOption = true;
            inheritOptions = this.getInheritOptions(options.excludeList);
        }
        for (let item of callback) {
            if (isInheriteByOption) {
                if (inheritOptions.indexOf(item.name) !== -1) {
                    inheritedCallbacks.push(item);
                }
            } else if (isExcludeByOption) {
                if (inheritOptions.indexOf(item.name) === -1) {
                    inheritedCallbacks.push(item);
                }
            }
        }
        if (!isInheriteByOption && !isExcludeByOption) {
            inheritedCallbacks = callback;
        }
        return inheritedCallbacks;
    }
};

let HelperApi = {
    generateRoute: function (router, routeMaps, prefix, parentCallbacks=[]) {
        prefix = prefix || '';
        routeMaps.forEach(function (item) {
            let url = Helper.concatUrl(prefix, item.urlReg);
            let method = Helper.checkMethod(item.method);

            let callbackType = Helper.getCallbackType(item.callback);
            let inheritParentCallbacks = Helper.filterInheritedCallback(parentCallbacks, item.options);
            let currentCallbacks = [];
            let allCallbacks = [];
            if (callbackType) {
                currentCallbacks = Helper.getCurrentCallback(item.callback);
            }
            if (currentCallbacks.length) {
                let rateLimiter = Helper.checkRateLimiter(router, item.options);
                allCallbacks = Helper.getAllCallback(currentCallbacks, inheritParentCallbacks);
                router[method](url, Helper.mergeCallback(allCallbacks, rateLimiter));
            } else {
                allCallbacks = inheritParentCallbacks;
            }
            if (Array.isArray(item.children) && item.children.length) {
                let parentCallbacks = Helper.getInheritedCallback(allCallbacks);
                this.generateRoute(router, item.children, url, parentCallbacks);
            }
        }, this);
        return router;
    },

    /**
     * router 快捷方式
     * reg        路径，对应req.path
     * children   自路由，同样的结构
     * callback   路由中间件，支持function,obj和Array
     * options    其他选项，目前仅支持rateLimit(接口请求频率限制)
     *      rateLimit.enable   是否启用
     *      rateLimit.total    总次数
     *      rateLimit.expire   时间范围，单位ms
     *      excludeList        不需要继承的中间件，string or array
     *      inheritList        需要继承的中间件，string or array
     */
    route: function (reg, method, children, callback, options={}) {
        return {
            urlReg: reg || '',
            method: method || 'get',
            children: children || [],
            callback: callback || [],
            options: options || {}
        };
    },

};

module.exports = HelperApi;

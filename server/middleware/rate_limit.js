module.exports = function (app, db) {
    return function (opts) {
        var middleware = function (req, res, next) {
            if (opts.whitelist && opts.whitelist(req)) {
                return next();
            }

            opts.onRateLimited = typeof opts.onRateLimited === 'function' ? opts.onRateLimited : function (req, res) {
                res.status(429).send('Rate limit exceeded');
            };

            opts.lookup = Array.isArray(opts.lookup) ? opts.lookup : [opts.lookup];
            var lookups = opts.lookup.map(function (item) {
                return item + ':' + item.split('.').reduce(function (prev, cur) {
                    return prev[cur];
                }, req);
            }).join(':');

            var path = opts.path || req.path;
            var method = (opts.method || req.method).toLowerCase();

            var countKey = 'rateCount:' + path + ':' + method + ':' + lookups;
            var infoKey = 'rateInfo:' + path + ':' + method + ':' + lookups;
            var info = 'rate limited';

            db.get(countKey, function (err, count) {
                if (err && opts.ignoreErrors) {
                    return next();
                }
                count = parseInt(count) || 0;
                if (count < opts.total) {
                    db.incr(countKey, function (err, newCount) {
                        if (newCount > opts.total) {
                            db.set(infoKey, info, 'PX', opts.expire, 'NX', function (err, data) {
                                if (data) {
                                    db.expire(countKey, Math.ceil(opts.expire/1000));
                                }
                            });
                            return opts.onRateLimited(req, res, next);
                        } else if (newCount === 1) {
                            db.expire(countKey, Math.ceil(opts.expire/1000));
                        }
                        next();
                    });
                } else {
                    db.set(infoKey, info, 'PX', opts.expire, 'NX', function (err, data) {
                        if (data) {
                            db.expire(countKey, Math.ceil(opts.expire/1000));
                        }
                    });
                    opts.onRateLimited(req, res, next);
                }
            });
        };

        if (typeof(opts.lookup) === 'function') {
            var callableLookup = opts.lookup;
            middleware = function (middleware, req, res, next) {
                return callableLookup(req, res, opts, function () {
                    return middleware(req, res, next);
                });
            }.bind(this, middleware);
        }

        if (opts.method && opts.path) app[opts.method](opts.path, middleware);

        return middleware;
    };
};

/**
 * handler 处理base流程
 * checkArgs => getData => filterData
 */

let fs = require('fs');
let path = require('path');

let _ = require('underscore');
let utils = require('../utils/index');

let BaseHandler = function (options) {
    this.req = options.req;
    this.res = options.res;
    this.next = options.next;
    this.moduleName = options.moduleName || '';
    this.actionName = options.actionName || '';
    return this;
};

/**
 * 初始化所有中间件参数
 * @param { express req } req
 * @param { express res } res
 * @param { express next } next
 */
BaseHandler.prototype.initRequest = function (req, res, next) {
    if (!this.req) {
        this.req = req;
    }
    if (!this.res) {
        this.res = res;
    }
    if (!this.next) {
        this.next = next;
    }
    return this;
};

/**
 * 获取参数检查规则
 * 可覆盖此方法实现动态定义检查规则
 */
BaseHandler.prototype.getArgRules = function () {
    return [];
};

/**
 * 参数检查
 * 可覆盖此方法实现特殊的检查
 */
BaseHandler.prototype.checkArgs = function (args) {
    if (!args) {
        var defaultArgs = this.req.method === 'POST' ? this.req.body : this.req.query;
        args = _.extend({}, defaultArgs);
    }

    let checkResult = { args: {}, error: '' };
    let argRules = this.argRules || this.getArgRules();

    if (Array.isArray(argRules) && argRules.length) {
        checkResult = utils.argCheck.checkArgs(args, argRules);
    } else {
        checkResult.args = utils.collections.deepCopy(args);
    }
    return checkResult;
};

/**
 * 数据获取和处理
 * 覆盖此方法实现数据获取和分析
 */
BaseHandler.prototype.getData = function () {
    return null;
};

/**
 * 数据输出
 * 覆盖此方法实现数据输出
 */
BaseHandler.prototype.filterData = function (data) {
    return data;
};


/**
 * 生成合适的handler处理请求
 * @param { 接口名 } actionName
 */
BaseHandler.prototype.action = function (actionName) {
    let self = this;
    return function (req, res, next) {
        let handler = self.getHandler({
            req: req,
            res: res,
            next: next,
            moduleName: self.moduleName,
            actionName: actionName
        });
        if (!handler) {  // 接口不支持
            return res.error('REQ_API_NOT_FOUND');
        }
        let argResult = handler.checkArgs();
        if (argResult && argResult.error) {
            return res.error('REQ_ARG_ERROR', {msg: argResult.error});
        }
        let data = handler.getData(argResult.args);
        if (!data) {
            return res.error('REQ_UNSUPPORTED_API');
        }
        if (data) {
            if (data.isEnd) {  // getData 方法自行处理返回
                return;
            } else if (data.error) {  // 数据出错
                if (Array.isArray(data.error)) {
                    return res.error(...data.error);
                } else {
                    return res.error(data.error);
                }
            }
            return res.customJson(handler.filterData(data.response));
        }
    };
};

/**
 * 获取具体接口的实际handler
 * @param { } options
 */
BaseHandler.prototype.getHandler = function (options) {
    let queryHandler = () => {
        let fileExtension = '.js';
        let handler = null;
        let filePath = `./${options.moduleName}/${options.actionName}`;
        if (fs.existsSync(path.join(__dirname, filePath + fileExtension))) {
            handler = require(filePath);
        }
        return handler;
    };

    let handler = queryHandler();
    if (handler) {
        return new handler(options);
    }
    return handler;
};

/**
 * 创建BaseHandler 的子类
 * @param { 原型对象 } protoProps 
 * @param { 静态属性对象 } staticProps 
 */
BaseHandler.extend = function (protoProps, staticProps) {
    let parent = this;
    let child;

    // 使用自定义的 constructor function 或者使用默认的 parent constructor
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function () {
            return parent.apply(this, arguments); 
        };
    }

    // 添加静态属性，如果有提供
    _.extend(child, parent, staticProps);

    // 添加prototype，设置原型链到parent
    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;

    // 添加parent prototype 的快捷属性，后面可能有需要
    child.__super__ = parent.prototype;

    return child;
};

module.exports = BaseHandler;

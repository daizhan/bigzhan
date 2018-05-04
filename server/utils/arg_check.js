let utils = require('../utils/index');
let _ = require('underscore');
let qs = require('querystring');

const MSG = {
    noValue: '缺少参数',
    typeError: '参数类型错误',
    validateError: '参数校验失败',
    intNoValue: '缺少参数',
    errorInt: '参数类型错误-int',
    floatNoValue: '缺少参数',
    errorFloat: '参数类型错误-float',
    exchangeError: '参数无法识别'
};

let ArgHelper = {

    isBoolType (value) {
        value = '' + value;
        if (value !== 'true' && value !== 'false') {
            return false;
        }
        return true;
    },

    isIntType (value) {
        value = '' + value;
        if (!value.match(/^[-+]?0*[0-9]+$/)) {
            return false;
        }
        return true;
    },

    isFloatArgType (value) {
        value = '' + value;
        if (!value.match(/^[-+]?0*[0-9]+(\.[0-9]+)?$/)) {
            return false;
        }
        return true;
    },

    checkArgType (argType, value) {
        let typeCheckResult = {
            value: value,
            error: false
        };
        let allowedType = ['int', 'float', 'bool', 'string'];

        if (!argType || !~allowedType.indexOf(argType)) {
            return typeCheckResult;
        }
        switch (argType) {
        case 'int':
            typeCheckResult.error = !this.isIntType(value);
            if (!typeCheckResult.erorr) {
                typeCheckResult.value = parseInt(value, 10);
            }
            break;
        case 'float':
            typeCheckResult.error = !this.isFloatType(value);
            if (!typeCheckResult.erorr) {
                typeCheckResult.value = parseFloat(value);
            }
            break;
        case 'bool':
            typeCheckResult.error = !this.isBoolType(value);
            if (!typeCheckResult.erorr) {
                typeCheckResult.value = value === 'true';
            }
            break;
        default:
            break;
        }
        return typeCheckResult;
    },

    // 暂不支持多个参数相互依赖的检测
    checkArgs (args, argRules) {
        if (!Array.isArray(argRules) || !argRules.length) {
            return { args: utils.collections.deepCopy(args) };
        }
        let checkResult = {
            args: {},
            error: false
        };
        for (let rule of argRules) {
            let backKey = rule.backKey;
            let frontKey = rule.frontKey;
            let value;
            if (rule.name) {
                backKey = frontKey = rule.name;
            }
            value = args[frontKey];
            if (typeof args[frontKey] === 'undefined' || args[frontKey] === '') {
                if (rule.require) {
                    checkResult.error = MSG.noValue + frontKey;
                    break;
                } else if (typeof rule.default !== 'undefined') {
                    value = rule.default;
                }
            }
            let typeCheckResult = this.checkArgType(rule.type, value);
            if (typeCheckResult.error) {
                checkResult.error = `${frontKey + MSG.typeError}: not ${rule.type}`;
                break;
            }
            value = typeCheckResult.value;
            if (typeof rule.validate === 'function') {
                let validateResult = rule.validate(value);
                if (validateResult.error) {
                    checkResult.error = `${frontKey + MSG.validateError}: ${validateResult.error}`;
                    break;
                }
                value = validateResult.value;
            }
            checkResult.args[backKey] = value;
            if (rule.exchange && rule.exchangeRule) {
                let exchangeArgs;
                try {
                    exchangeArgs = qs.parse(value);
                } catch(e) {
                    exchangeArgs = null;
                    checkResult.error = `${frontKey + MSG.exchangeError}`;
                    break;
                }
                let exchangeRusult = this.checkArgsPlus(exchangeArgs, rule.exchangeRule);
                if (exchangeRusult.erorr) {
                    checkResult.error = exchangeRusult.error;
                    break;
                } else {
                    _.extend(checkResult.args, exchangeRusult.args);
                }
            }
        }
        return checkResult;
    }
};

module.exports = ArgHelper;

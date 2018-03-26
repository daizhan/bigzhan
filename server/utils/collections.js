module.exports = {
    /**
     * 深度复制自身可枚举属性
     * @param obj
     */
    deepCopy (obj) {
        let newObj;
        if (!obj) { // 可能是null, undefined 之类
            return obj;
        } else if (typeof obj === 'function') { // 函数直接返回
            return obj;
        } else if (Array.isArray(obj)) {
            newObj = [];
            for (let item of obj) {
                newObj.push(this.deepCopy(item));
            }
        } else if (typeof obj === 'object') {
            newObj = {};
            for (let key of Object.keys(obj)) {
                newObj[key] = this.deepCopy(obj[key]);
            }
        } else {
            return obj;
        }
        return newObj;
    },


    /**
     * 属性合并
     */
    extend (target, ...sources) {
        for (let obj of sources) {
            for (let key of Object.keys(obj)) {
                if (!target.hasOwnProperty(key)) {
                    target[key] = obj[key];
                } else {
                    let tKeyType = typeof target[key];
                    let sKeyType = typeof obj[key];
                    if (tKeyType !== sKeyType) {
                        target[key] = obj[key];
                    } else if (tKeyType === sKeyType && tKeyType !== 'object') {
                        target[key] = obj[key];
                    } else {
                        target[key] = this.extend({}, target[key], obj[key]);
                    }
                }
            }
        }
        return target;
    }
};
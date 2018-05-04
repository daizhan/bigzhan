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
    },

    /**
     * 根据数据格式，转化吐出到前端页面的数据
     */
    filterBackData: function (data, dataFormat = null) {
        var newData = {};
        if (!dataFormat || !Array.isArray(dataFormat) || !dataFormat.length) {
            return data;
        }
        for (let format of dataFormat) {
            if (typeof format == 'string') {
                if (Array.isArray(data[format])) {
                    newData[format] = [];
                    for (let item of data[format]) {
                        newData[format].push(item);
                    }
                } else {
                    newData[format] = data[format];
                }
            } else if (typeof format == 'object') {
                let frontKey = format.name || format.frontKey;
                let backKey = format.name || format.backKey;
                let oriData;
                let obj = null;
                if (format.subKey) {
                    oriData = data[backKey][format.subKey];
                    obj = data[backKey];
                } else {
                    oriData = data[backKey];
                    obj = data;
                }
                if (typeof oriData == 'undefined') {
                    newData[frontKey] = format.default;
                    continue;
                }
                if (!format.keys) {
                    if (Array.isArray(oriData)) {
                        newData[frontKey] = [];
                        for (let item of oriData) {
                            newData[frontKey].push(item);
                            if (format.formatter) {
                                newData[frontKey].push(format.formatter(item, obj));
                            } else {
                                newData[frontKey].push(item);
                            }
                        }
                    } else {
                        if (format.formatter) {
                            newData[frontKey] = format.formatter(oriData, obj);
                        } else {
                            newData[frontKey] = oriData;
                        }
                    }
                } else {
                    if (Array.isArray(oriData)) {
                        newData[frontKey] = [];
                        for (let item of oriData) {
                            newData[frontKey].push(this.filterBackData(item, format.keys));
                        }
                    } else {
                        newData[frontKey] = this.filterBackData(oriData, format.keys);
                    }
                }
            }
        }
        return newData;
    }
};

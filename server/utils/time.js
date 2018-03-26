/**
 * 时间相关函数
 */

let _ = require('underscore');

module.exports = {
    insertZero: function (num, count) {
        num = '' + (parseInt(num) || 0);
        count = count || 0;
        if (count <= 0 || count <= num.length) return num;
        return new Array(count + 1 - num.length).join('0') + num;
    },
    /**
     * 时间格式化
     * @param { Date or timestamp } time
     * @param { String } format 
     */
    format: function (date, format, timeType = '') {
        let allowedType = ['UTC'];
        if (!~allowedType.indexOf(timeType)) {
            timeType = '';
        }
        var placehodler = {
            '%Y': `get${timeType}FullYear`,
            '%m': `get${timeType}Month`,
            '%d': `get${timeType}Date`,
            '%H': `get${timeType}Hours`,
            '%M': `get${timeType}Minutes`,
            '%S': `get${timeType}Seconds`
        };
        _.each(placehodler, function (value, key) {
            if (key == '%Y') {
                value = date[value]();
            } else {
                if (key == '%m') {
                    value = this.insertZero(date[value]() + 1, 2);
                } else {
                    value = this.insertZero(date[value](), 2);
                }
            }
            format = format.replace(key, value);
        }, this);
        return format;
    }
};
/**
 * 时间相关函数
 */

let _ = require('underscore');

module.exports = {
    /**
     * 时间格式化
     * @param { Date or timestamp } time
     * @param { String } format 
     */
    format (time, format) {
        if (!(time instanceof Date)) {
            time = new Date(time);
        }
        let preDefinedFormat = {
            '%Y': 'getFullYear',
            '%m': 'getMonth',
            '%d': 'getDate',
            '%H': 'getHours',
            '%M': 'getMinutes',
            '%S': 'getSeconds',
        };
        _.each(preDefinedFormat, (func, key) => {
            if (key === '%m') {  // 月份从0开始，需要+1
                format = format.replace(key, time[func]() + 1);
            } else {
                format = format.replace(key, time[func]());
            }
        });
    }
};
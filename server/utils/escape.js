/**
 * html escape
 */

let _ = require('underscore');

module.exports = {
    escapeHTML (data) {
        var escapeData = data;
        if (typeof data === 'string') {
            escapeData = _.escape(data);
        } else if (Array.isArray(data)) {
            escapeData = [];
            for (let item of data) {
                escapeData.push(this.escapeHTML(item));
            }
        } else if (typeof data === 'object') {
            if (data) { // 排除 null
                escapeData = {};
                _.each(data, (item, key) => {
                    escapeData[key] = this.escapeHTML(item);
                });
            }
        }
        return escapeData;
    },

    unescapeHTML (data) {
        var oriData = data;
        if (typeof data === 'string') {
            oriData = _.unescape(data);
        } else if (Array.isArray(data)) {
            oriData = [];
            for (let item of data) {
                oriData.push(this.unescapeHTML(item));
            }
        } else if (typeof data === 'object') {
            if (data) { // 排除 null
                oriData = {};
                _.each(data, (item, key) => {
                    oriData[key] = this.unescapeHTML(item);
                });
            }
        }
        return oriData;
    }
};
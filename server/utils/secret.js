var _ = require('underscore');
var crypto = require('crypto');

var Secret = {
    /**
     * 加密文本
     */
    cryptoText: function (text, algorithm = 'md5', encoding = 'hex') {
        var hash = crypto.createHash(algorithm);
        return hash.update(text).digest(encoding);
    },

    /**
     * 签名值生成与判断
     * salt = md5(md5('sign_salt_for_web_page'))
     */
    getSign (args, salt = '0bf566c1c566d4a4') {
        args = args || {};
        let keys = _.keys(args).sort();
        let str = '';
        for (let key of keys) {
            str += `${key}=${args[key]}`;
        }
        if (!str) {
            return false;
        }
        return this.cryptoText(str + salt);
    },

    checkSign (sign, args, salt = '0bf566c1c566d4a4') {
        return sign === this.getSign(args, salt);
    },
};

module.exports = Secret;

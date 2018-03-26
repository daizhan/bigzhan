/**
 * 环境相关实用函数
 */

module.exports = {
    /**
     * 获取当前环境变量
     * @param { express req } req 
     */
    getType (req) {
        if (req) {
            return req.config.env.label;
        }
        return process.env.NODE_ENV || '';
    }
};
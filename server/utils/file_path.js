/**
 * 文件路径实用方法
 */

let fs = require('fs');
let path = require('path');

module.exports = {
    isFileExist (filePath) {
        return fs.existsSync(filePath);
    },

    /**
     * 创建路径 
     * @param { String } path
     */
    createPath (pathName) {
        if (this.isFileExist(pathName)) {
            return true;
        }
        this.createPath(path.dirname(pathName));
        fs.mkdirSync(pathName, 0o775);
    }
};
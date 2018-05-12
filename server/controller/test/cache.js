/**
 * demo for test handler
 */

let BaseHandler = require('../base');
let utils = require('../../utils/index');
let storageServie = require('../../service/storage');

let staticProps = {};

let protoProps = {
    // 参数规则
    argRules: [
        // {
        //     frontKey: '',             // 页面参数名称
        //     backKey: '',              // node 参数名称
        //     name: '',                 // 前后名称一致使用
        //     require: true,            // 是否必传
        //     default: '',              // 默认值
        //     type: '',                 // 数据类型
        //     validate: function () {}  // 自定义验证
        // }
    ],
    getData (args) {
        let cache = storageServie.getCacheClient();
        cache.get('jack', (error, data) => {
            if (!this.req.session.count) {
                this.req.session.count = 1;
            } else {
                this.req.session.count += 1;
            }
            this.res.send({count: this.req.session.count, error: error, data: data});
        });
        return {isEnd: true};
    },

    filterData (data) {
        var dataMap = [
            {
                frontKey: 'id',
                backKey: 'orderId'
            },
            'name'
        ];
        return utils.collections.filterBackData(data, dataMap);
    }
};

let testHandler = BaseHandler.extend(protoProps, staticProps);

module.exports = testHandler;

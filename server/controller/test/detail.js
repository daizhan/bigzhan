/**
 * demo for test handler
 */

let BaseHandler = require('../base');
let utils = require('../../utils/index');

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
        {
            name: 'orderId',
            require: true,
            type: 'string'
        }
    ],
    getData (args) {
        let data = {name: 'jack'};
        data.orderId = args.orderId;
        this.res.send(data);
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

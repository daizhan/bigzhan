/**
 * demo for test handler
 */

let BaseHandler = require('../base');
let utils = require('../../utils/index');
let storage = require('../../service/storage');

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
            name: 'name',
            require: true,
            type: 'string'
        }
    ],
    getData (args) {
        let db = storage.getMysqlClient();
        let count = 0;
        let dbData = [];
        let callback = (error, results, fields) => {
            let data = {name: args.name, error: error, results: results};
            dbData.push(JSON.stringify(data));
            count += 1;
            if (count >= 9) {
                this.res.send(dbData.join('<br />'));
            }
        };
        db.query('select * from `user` where `name` = ?', [args.name], callback);
        db.query('select * from `user` where `name` = ?', [args.name], callback);
        db.query('select * from `user` where `name` = ?', [args.name], callback);
        db.query('select * from `user` where `name` = ?', [args.name], callback);
        db.query('select * from `user` where `name` = ?', [args.name], callback);
        db.query('select * from `user` where `name` = ?', [args.name], callback);
        db.query('select * from `user` where `name` = ?', [args.name], callback);
        db.query('select * from `user` where `name` = ?', [args.name], callback);
        this.req.dbClient.query('select * from `user` where `name` = ?', [args.name], callback);
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

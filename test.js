// const { Fooler } = require('fooler-core');
const { Fooler } = require('./index');
const app = new Fooler({
    p: 8081,            //web服务端口（默认80）
    processes: 1,       //服务进程数,缺省或0时=cpu核数，在expand定义可以热更新动态调整进程数
    route: __dirname + '/test-routes',   //(建议使用)初始化路由模块
    event: __dirname + '/test-events',   //(建议使用)初始化事件模块
    log: {
        // level: ['error', 'log', 'warn', 'info'], //捕获的级别（console.的方法,默认当前这4个）
        // error: (...args) => { return JSON.stringify(args) },        //自定义格式化日志格式
        // log: (...args) => { return JSON.stringify(args) },          //自定义格式化日志格式
        // warn: (...args) => { return JSON.stringify(args) },         //自定义格式化日志格式
        path: '/test.{{yyyy-mm-dd}}.log', //日志目录配置，一旦配置，console.log,error,warn,info 将会写入该文件
    },
    //expand: `${__dirname}/conf.json`,  //(建议使用)拓展配置，可以在热更新时进行重载配置项
});
app.run();
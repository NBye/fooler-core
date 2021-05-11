const { Fooler } = require('./index');
const app = new Fooler({
    root: __dirname,    //项目根目录
    p: 8080,            //web服务端口（默认80）
    processes: 1,       //服务进程数,缺省或0时=cpu核数，在expand定义可以热更新动态调整进程数
    route: __dirname + '/test-routes',   //初始化路由模块
    event: __dirname + '/test-events',   //初始化事件模块
    log: {
        level: ['error', 'log', 'warn'], //捕获的级别
        // error: (...args) => { return JSON.stringify(args) },        //自定义格式化日志格式
        // log: (...args) => { return JSON.stringify(args) },          //自定义格式化日志格式
        // warn: (...args) => { return JSON.stringify(args) },         //自定义格式化日志格式
        path: '/test.{{yyyy-mm-dd}}.log', //日志目录配置，一旦配置，console.log,error,warn 将会写入
    },
    //expand: `${__dirname}/conf.json`,  //拓展配置，可以在热更新时进行重载配置项
});
app.run();
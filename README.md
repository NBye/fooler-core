# fooler-core
node http web api framework
### 一、框架优势
1. 安装简单
    - 引包即用，可单文件多文件均可开发。
2. 概念少
    - 不像其他框架那样，Router、middleware、pipline、controller， 每个概念都有独立规则与用法。
    - 本框架只有 Router(路由)、control(过程)，变通control的开发与顺序可以做到框架的增强。
3. 易于拓展
    - Router 可以设置无限个 control
    - 根据 control 的设置顺序与作用自行分组，可以起到 middleware、pipline、controller 的效果，并且规则用法一致。
    - Router 可以设置子集 Router，向树杈一样，一层层向子集调用，并一层层向外抛出结果。
4. 对接框架处理
    - 热更新、重启、全局错误接收，可自定制系统维护系统。

### 二、安装使用
1. 安装
    - npm install fooler-core
2. 编写代码 test2.js
    ```javascript
    const {Fooler} = require('fooler-core');
    const app = new Fooler({
        p: 8080
    });
    app.route.GET('/hello').then(({ctx})=>{
        ctx.sendHTML('hello world');
    });
    app.route.GET(/^\/hello/(\w+)$/).then(({ctx,match})=>{
        ctx.sendHTML(`hello ${match[0]}`);
    });
    app.run();
    ```
3. 执行
    ```
    node test2.js
    ```
4. 浏览器访问
    ```
    http://127.0.0.1:8080/hello
    http://127.0.0.1:8080/hello/xiaoming
    ```

### 三、使用说明书

1. 事件 “event”
    - 事件是系统提供捕获：错误、热重启、进程重启、事件路由的重载
    - 请看：/test-events.js
2. 路由 “route”
    - 是配置根据uri地址与处理程序关系的对象
    - 请看：/test-routes.js
    - 2.1 子路由
        - 任何路由都可以无限制创建子路由，向树枝一样，可以无限向下分
        - roue.when(path, ["GET", "POST", "PUT"]).childens((r)=>{});
    - 2.2 命中
        - 路由会根据配置的正则或者url路径进行匹配，匹配成功则命中，同时只能命中考前的1个
        - 2.2.1 正则路由
            - 路由的表达式为正则，可以通过正则的(\w+)捕获参数
            - roue.when(/^\/user\/(info)\/(\d+)/ , ["GET"].then(({ctx,match})=>ctx.sendJSON(match))
        - 2.2.2 字符串路由
            - 路由的表达式为字符串，满足表达式全等与uri则会命中，字符串路由会将父级路由与自己路由组合匹配命中
            - roue.when('/user/info' , ["GET"].then(({ctx})=>ctx.sendJSON([ctx.GET(),ctx.POST()]))
        - 2.2.3 混合路由
            - 路由与子路由，多个子路由之间，随意混合。正则不会与父级别路合并匹配，但字符串路由会
    - 2.3 过程 “control”
        - 过程是路由命中后的的处理函数
        - 2.3.1 顺序过程
            - 过程被按先后设置顺序执行
            - roue.then(contr1,contr2,contr3).then(contr4).then(contr5)
        - 2.3.2 并行过程
            - 过程被并行执行
            - roue.then([contr1,contr2,contr3])
3. 路由的方法
    - roue.when(rule,["GET","协议方法"])      //路由命中规则,返回子Router
    - roue.GET(rule)                         //路由命中规则,返回子Router
    - roue.POST(rule)                        //路由命中规则,返回子Router
    - roue.PUT(rule)                         //路由命中规则,返回子Router
    - roue.OPTIONS(rule)                     //路由命中规则,返回子Router
    - roue.DELETE(rule)                      //路由命中规则,返回子Router
    - roue.HEAD (rule)                       //路由命中规则,返回子Router
    - roue.childens                          //路由添加子路由,返回自己
    - roue.then(contr1,contr2,contr3)        //命中路由执行过程设置,返回自己
    - roue.catch(contr1,contr2,contr3)       //命中路由执行异常接收过程设置,返回自己
    - roue.finally(contr1,contr2,contr3)     //命中路最后如果为发生send过程设置,返回自己

### 四、完整使用示例

1. 编写入口文件 app.js
    ```javascript
    const {Fooler} = require('fooler-core')
    const app = new Fooler({
        //web服务端口（默认80）
        p: 8080,   
        //服务进程数,缺省或0时=cpu核数，在expand定义可以热更新动态调整进程数         
        processes: 1,    
        //初始化路由模块,写在该属性上可以支持热更新（可以不设置、也可以设置到当前文件内）   
        route: __dirname + '/app-routes', 
        //初始化事件模块,写在该属性上可以支持热更新（可以不设置、也可以设置到当前文件内）  
        event: __dirname + '/app-events',   
        //该项不设置，或log.path不设置 则不会将console输出到log.path文件上
        log: {
            //捕获的级别
            level: ['error', 'log', 'warn'], 
            //自定义格式化日志格式
            // error: (...args) => { return JSON.stringify(args) }, 
            // log: (...args) => { return JSON.stringify(args) },
            // warn: (...args) => { return JSON.stringify(args) },
            //日志目录配置，一旦配置，console.log,error,warn 将会写入
            path: '/test.{{yyyy-mm-dd}}.log', 
        },
        //expand: `${__dirname}/conf.json`,  //配置拓展，可以在热更新时进行重载,并覆盖代码中的设置
    });
    app.run();
    ````
2. 编写路由文件 app-routes.js
    ```javascript
    module.exports = async function (roue) {
        roue.then(async ({ ctx }) => {
            ctx.stime = Date.now();
        }).catch(async ({ err, ctx }) => {//异常被执行的过程
            ctx.sendHTML(`<pre>${err.stack}</pre>`)
        }).finally(async ({ ctx }) => {//总会被执行
            let timer = parseInt((Date.now() - ctx.stime) / 1000);
            console.log(`[${ctx.req.method},${ctx.res.statusCode}] ${ctx.req.url} use:${timer}ms`);
        });
        roue.when('/api/v2')
            .childens((r) => {
                //请求 http GET /api/v2/fn1
                r.GET('/fn1').then(({ctx})=>ctx.sendHTML("fn1"))
                //请求 http GET /api/v2/fn2
                r.GET('/fn2').then(({ctx})=>ctx.sendHTML("fn2"))
                //请求 http GET /api/v2/www
                r.GET(/^\/api\/v2\/(\w+)$/).then(({ctx,match})=>ctx.sendHTML("fn2: " + match.join(',')))
            }).catch(async (err) => {
                //捕获异常，但不返回让父级的finally处理输出
                console.log(err);
            });
        //更多请看 test-routes.js
    }
    ```
3. 编写路事件文件 app-events.js
    ```javascript
    const { loadlogRouter, loadlogEvents } = require('./index');
    module.exports = function (app) {
        app.on('error', async function (err) {
            console.error('on error:', err);
        }, '服务错误回调事件');
        app.on('restart', async function () {
            console.log('on restart');
        }, '服务被重启回调事件');
        app.on('reload', async function () {
            console.log('on reload');
        }, '服务被重载回调事件');
        app.on('load-events', async function (service) {
            loadlogEvents(service);
        }, '加载事件完成时');
        app.on('load-router', async function (service) {
            loadlogRouter(service);
        }, '加载路由完成时时');
    }
    ```

### 五、过程定义使用详解
```javascript
/**
 * 这是一个处理过程示例
 * 本框架不区分 中间件、控制器、管道 等，一切均为过程，过程可以并行、串行，按路由定义顺序执行。
 * {
 *     ctx      : 请求上下文 
 *     options  : app初始化的参数对象
 *     match    : 正则路由匹配成功的列表
 *     err      : 上一个路由命中时 抛出错误
 * }
 */
const control = async function ({ ctx, options, router, match = null, err = null }) {
    return ctx.send({
        text: require('fs').readFileSync(__filename),
        status: 200,
        headers: { 'Content-Type': 'text/javascript;charset=UTF-8' }
    });

    let [m1, m2, m3] = match || ['', '', '']; //正则路由通过match拿到

    ctx.req;  //原生对象：Request
    ctx.res;  //原生对象：Reponse
    ctx.service;    //框架服务对象
    ctx.options;    //框架app启动配置，参数中的 options 为该对象中的引用

    ctx.router;     //命中的rooter对象

    ctx.data;               //请求上下文中的全局data存储对象
    ctx.data.set(key, val); //设置临时变量 key支持'key.key1.key2'
    ctx.data.get(key);      //获取临时变量 key支持'key.key1.key2'

    ctx.cookie;             //请求上下文cookie对象
    ctx.cookie.set(key, value, options = { path: '/' }) //设置cookie
    ctx.cookie.get(key)                                 //获取cookie

    /* 如何想使用 session ,可以自定义中间件，给ctx设置session对象。可参考中间件: /middleware/plug/Session.js */

    ctx.completed   //一次请求中，是否已发送结束(发送结束不代表执行结束)，completed一旦设置为true，后续的 ctx.send????() 将失效

    ctx.FILES(key);             //获取提交上来的图片{key:{data:Buffer,filename:'文件名',type:'文件IME类型'}}
    ctx.GET(key);               //获取GET参数
    ctx.POST(key);              //获取POST参数
    ctx.setdHeader(key, val);   //设置header

    ctx.send({ text, status, headers }) //发送数据 并设置 completed=true
    ctx.sendJSON(data, status)          //发送JSON数据 并设置 completed=true
    ctx.sendHTML(html, status)          //发送HTML数据 并设置 completed=true
};
```

### 六、进阶
1. session 的使用
2. Gzip 的开启
3. 跨域的开启
4. Rpc 模式使用
5. 与VUE结合使用
6. 系统拓展开发
7. 静态文件服务

> 请查看 https://github.com/NBye 中更多的fooler 组件

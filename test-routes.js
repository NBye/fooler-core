const fs = require('fs');
const Auth = async function ({ ctx }) {
    if (parseInt(Math.random() * 100) % 2) {
        throw new Error('随机概率认证失败');
    } else {
        //真正成功则可以给请求赋值为后需过程使用
        ctx.user = { name: 'Tester' };
    }
};

const ControllerFn1 = async function ({ ctx }) {
    ctx.sendHTML(`hello ${ctx.req.url} 1111 !`);
};
const ControllerFn2 = async function ({ ctx }) {
    ctx.sendHTML(`hello ${ctx.req.url} 2222 !`);

};
const ControllerSetTimeout = function (text) {
    return async function ({ ctx }) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(ctx.req.url + text + new Date());
                resolve()
            }, 1000)
        })
    }
};
module.exports = async function (roue) {
    const doc = `
<pre>
概念：
1. 事件 “event”
    事件是系统提供捕获：错误、热重启、进程重启、事件路由的重载
    请看：/test-events.js
2. 路由 “route”
    是配置根据uri地址与处理程序关系的对象
    请看：/test-routes.js
    2.1 子路由
        任何路由都可以无限制创建子路由，向树枝一样，可以无限向下分
        roue.when(path, ["GET", "POST", "PUT"]).childens((r)=>{});
    2.2 命中
        路由会根据配置的正则或者url路径进行匹配，匹配成功则命中，同时只能命中考前的1个
        2.2.1 正则路由
            路由的表达式为正则，可以通过正则的(\w+)捕获参数
            roue.when(/^\/user\/(info)\/(\d+)/ , ["GET"].then(({ctx,match})=>ctx.sendJSON(match))
        2.2.2 字符串路由
            路由的表达式为字符串，满足表达式全等与uri则会命中，字符串路由会将父级路由与自己路由组合匹配命中
            roue.when('/user/info' , ["GET"].then(({ctx})=>ctx.sendJSON([ctx.GET(),ctx.POST()]))
        2.2.3 混合路由
            路由与子路由，多个子路由之间，随意混合。正则不会与父级别路合并匹配，但字符串路由会
    2.3 过程 “control”
        过程是路由命中后的的处理函数
        2.3.1 顺序过程
            过程被按先后设置顺序执行
            roue.then(contr1,contr2,contr3).then(contr4).then(contr5)
        2.3.2 并行过程
            过程被并行执行
            roue.then([contr1,contr2,contr3])
3. 路由的方法
    roue.when(rule,["GET","协议方法"])      //路由命中规则,返回子Router
    roue.GET(rule)                         //路由命中规则,返回子Router
    roue.POST(rule)                        //路由命中规则,返回子Router
    roue.PUT(rule)                         //路由命中规则,返回子Router
    roue.OPTIONS(rule)                     //路由命中规则,返回子Router
    roue.DELETE(rule)                      //路由命中规则,返回子Router
    roue.HEAD (rule)                       //路由命中规则,返回子Router
    roue.childens                          //路由添加子路由,返回自己

    roue.then(contr1,contr2,contr3)        //命中路由执行过程设置,返回自己
    roue.catch(contr1,contr2,contr3)       //命中路由执行异常接收过程设置,返回自己
    roue.finally(contr1,contr2,contr3)     //命中路最后如果为发生send过程设置,返回自己

    如果业务需要获得 post，file 数据，必须为路由添加post解析工具，系统自带：
    const { Utils } = require('fooler-core');
    route.then(Utils.httpParseStream) //这是关键
    route.then(/.*/).then(({ctx})=>{ctx.sendHTML('你好')});

4. 测试地址
</pre>

<div>请分别尝试请求地址：</div>
<div><a href="/test/execution/sequence">/test/execution/sequence，验证过程顺序，这个地址会有5s延迟请等待,注意控制台输出顺序</a></div>
<div><a href="/api/auth">/api/auth，验证中间件</a></div>
<div><a href="/api/v1/fn1">/api/v1/fn1 验证正则混合论有</a></div>
<div><a href="/api/v1/fn2">/api/(v1)/(fn2) 验证正则路由,获取地址值</a></div>
<div><a href="/api/v2/fn1">/api/v2/fn1 验证字符串路由1</a></div>
<div><a href="/api/v2/fn2">/api/v2/fn2 验证字符串路由2</a></div>
<div>将某类过程按功能分类就可以做中间件，管道，插件。如：session，登录权限，gzip压缩</div>
<div>本程序代码请参考 test.js， 启动代码 node test.js</div>

<pre>

/**
 * 这是一个处理过程 
 * 本框架不区分 中间件、控制器、管道 等，一切均为过程，过程可以并行、串行，按路由定义顺序执行。
 * {
 *     ctx      : 请求上下文 
 *     options  : app初始化的参数对象
 *     match    : 正则路由匹配成功的列表
 *     err      : 上一个路由命中时 抛出错误1
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
</pre>
`;

    roue.then(async ({ ctx }) => {
        ctx.stime = Date.now();
    }).catch(async ({ err, ctx }) => {            //异常被执行的过程
        ctx.sendHTML(`<pre>${err.stack}</pre>`)
    }).finally(async ({ ctx }) => {     //总会被执行
        let timer = parseInt((Date.now() - ctx.stime) / 1000);
        console.log(`[${ctx.req.method},${ctx.res.statusCode}] ${ctx.req.url} use:${timer}ms`);
    });
    roue.GET('/test/execution/sequence')
        .then(                            //[]中的过程并行执行
            [ControllerSetTimeout('并发1'),
            ControllerSetTimeout('并发2')],
            ControllerSetTimeout('并发3')   //单独参数顺序执行
        ).then(                             //如果多个参数都是函数则顺序执行
            ControllerSetTimeout('并发4'),
            ControllerSetTimeout('并发5'),
        ).then(({ ctx }) => {
            ctx.sendHTML('/test/execution/sequence，请看控制台的输出顺序');
        })

    //可直接 监听字符串 路由：uri 全等会
    roue.GET('/api/auth')
        .then(Auth) //使用中间件，本质与过程无任何区别
        .then(({ ctx }) => ctx.sendJSON({ code: 1, msg: '验证成功,多刷新会有概率进入auth失败' }))

    //正则字符串混合路由
    roue.when(/^\/api\/v1/, ["GET", "POST", "PUT"])
        .childens((r) => {
            r.GET('/api/v1/fn1').then(ControllerFn1)        //等价于http GET /api/v1/fn1
            r.GET(/^\/api\/v1\/(fn2)$/).then(ControllerFn2) //等价于http get /api/v1/fn2 正则可以在过程的match参数中拿到
        });

    //纯字符串路由，会叠加合并
    roue.when('/api/v2')
        .childens((r) => {
            r.GET('/fn1').then(ControllerFn1)               //等价于http GET /api/v2/fn1
            r.GET('/fn2').then(ControllerFn2)               //等价于http GET /api/v2/fn2
            r.GET(/^\/api\/v2\/fn2$/).then(ControllerFn2)   //等价于http GET /api/v2/fn2
        }).catch(async (err) => {
            console.log(err);
        });

    roue.when('/', ['GET']).then(({ ctx }) => {
        ctx.sendHTML(doc);
    })
}



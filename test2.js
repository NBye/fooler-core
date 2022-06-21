// const { Fooler } = require('fooler-core');
const { Fooler, loadlogRouter, loadlogEvents, Utils } = require('./index');
const app = new Fooler({
    p: 8082,
    processes: 1,
});

app.route.GET(/^\/hello\/(\w+)$/).then(({ ctx, match }) => {
    ctx.sendHTML(`hello ${match[0]}`);
});

/**
 * 为路由设置 独立解析器
 * 参数1 路由表达式(必要)
 * 参数2 请求协议
 * post 会在第一次获取是解析流；
 * 如果需要自定义解析，需要自己实现解析函数，并解析以下4个变量：
 * req._post_data   //必要，必须赋值该变量
 * req._file_data   //必要，必须赋值该变量
 * req._query_data   
 * req._cookie_data
 */
app.route.when('/hello', ['POST'])
    // .then(Utils.httpParseStream) //这是框架提供的Post流解析工具
    .then(({ ctx }) => {
        //这里由于先执行获取post，导致后续的解析失效。
        console.log(1, {
            GET: ctx.GET(),
            POST: ctx.POST(),
        })
    }).childens((r) => {
        r.POST('/test').then(async ({ ctx }) => {
            let req = ctx.req;
            return new Promise((resolve, reject) => {
                if (req._post_data) {
                    console.log('被解析过不能再次解析');
                    return resolve();
                }
                let buff = Buffer.from('');
                req.on('data', (chunk) => {
                    buff = Buffer.concat([buff, chunk]);
                });
                req.on('end', () => {
                    req._query_data = { get: 1 }; //可自定义解析结果 GET
                    req._post_data = { post: 2 };  //可自定义解析结果 POST
                    req._file_data = { file: 3 };  //可自定义解析结果 FILE
                    resolve();
                });
                req.on('error', (e) => {
                    reject(err);
                });
            });
        }).then(({ ctx }) => {
            ctx.sendHTML('hello world');
            console.log({
                GET: ctx.GET(),
                POST: ctx.POST(),
                FILES: ctx.FILES(),
            })
        })
    });

/**
 * 所以需要在获取post，files 之前 定义解析
 * 使用过程代替自定义解析器的方式
 */
app.route.POST('/test/parse').then(async ({ ctx }) => {
    return new Promise((resolve, reject) => {
        let buff = Buffer.from('');
        let req = ctx.req;
        req.on('data', (chunk) => {
            buff = Buffer.concat([buff, chunk]);
        });
        req.on('end', () => {
            req._query_data = { get: 1 }; //可自定义解析结果 GET
            req._post_data = { post: 2 };  //可自定义解析结果 POST
            req._file_data = { file: 3 };  //可自定义解析结果 FILE
            resolve();
        });
        req.on('error', () => {
            reject(err);
        });
    });
}).then(({ ctx }) => {
    ctx.sendHTML('hello world');
    console.log(2, {
        GET: ctx.GET(),
        POST: ctx.POST(),
        FILES: ctx.FILES(),
    })
})

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
app.run();
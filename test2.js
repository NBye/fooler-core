// const { Fooler } = require('fooler-core');
const { Fooler } = require('./index');
const app = new Fooler({
    p: 8080
});


app.route.GET(/^\/hello\/(\w+)$/).then(({ ctx, match }) => {
    ctx.sendHTML(`hello ${match[0]}`);
});


/**
 * 为路由设置 独立解析器
 * 参数1 路由表达式(必要)
 * 参数2 请求协议
 * 参数3 请求数据解析器(缺省内置)，===false 强制不解析，解析器在一次请求中只能执行第一次的解析器；
 */
app.route.when('/hello', ['POST'], false).then(({ ctx }) => {
    console.log(1, {
        GET: ctx.GET(),
        POST: ctx.POST(),
    })
}).childens((r) => {
    r.POST('/test', async (req) => {
        return new Promise((resolve, reject) => {
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
            req.on('error', () => {
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
 * 使用过程代替自定义解析器的方式
 */
app.route.POST('/test/parse', false).then(async ({ ctx }) => {
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

app.run();
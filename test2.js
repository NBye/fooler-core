// const { Fooler } = require('fooler-core');
const { Fooler } = require('./index');
const app = new Fooler({
    p: 8080
});
/**
 * 为路由设置 独立解析器
 * 参数1 路由表达式(必要)
 * 参数2 请求协议
 * 参数3 请求数据解析器
 */
app.route.when('/hello', ['POST', 'GET'], async (req) => {
    return new Promise((resolve, reject) => {
        let buff = Buffer.from('');
        req.on('data', (chunk) => {
            buff = Buffer.concat([buff, chunk]);
        });
        req.on('end', () => {
            req._query_data = {}; //可自定义解析 GET
            req._post_data = {};  //可自定义解析 POST
            req._file_data = {};  //可自定义解析 FILE
            resolve();
        });
        req.on('error', () => {
            reject(err);
        });
    });
}).childens((r) => {
    r.POST('/test').then(({ ctx }) => {
        ctx.sendHTML('hello world');
        //由于父级路由覆盖了默认的解析器，让POST,GET,FILE 都为空对象；导致后续处理无法获取真实的数据
        //当然子级路由也可以设置覆盖独立的解析器
        console.log({
            GET: ctx.GET(),
            POST: ctx.POST(),
        })
    })
});

app.route.GET(/^\/hello\/(\w+)$/).then(({ ctx, match }) => {
    ctx.sendHTML(`hello ${match[0]}`);
});
app.run();
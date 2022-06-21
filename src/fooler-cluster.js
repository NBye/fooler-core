const http = require("http");
const Log = require("./lib/Log");
const process = require('process');
const Context = require('./Context');

const httpProcessExec = async function (route, procedures, match, ctx, err) {
    for (let i = 0; i < procedures.length; i++) {
        if (procedures[i] instanceof Function) {
            await procedures[i](Object.assign({ ctx, route, match, err }, ctx));
        } else if (procedures[i] instanceof Array) {
            let list = [];
            procedures[i].forEach(procedure => {
                list.push(procedure(Object.assign({ ctx, route, match, err }, ctx)));
            });
            await Promise.all(list);
        } else {
            throw Error(`${route.expression} have one not Function !`);
        }
    }
}

const httpProcess = async function (route, match, ctx, uri) {
    try {
        //1. 执行then;
        await httpProcessExec(route, route.procedures, match, ctx);
        //2. 执行子路由;
        for (let i = 0; i < route.ChildenRouters.length; i++) {
            let croute = route.ChildenRouters[i];
            let cmatch = croute.do({ uri, method: ctx.req.method, ctx, domain: ctx.req.headers['host'] });
            if (cmatch) {
                await httpProcess(croute, cmatch, ctx, uri);
                break;
            }
        }
    } catch (err) {
        //3. 执行catch,如果未设置接受则继续向外层路由抛出;
        if (route.catchs.length) {
            await httpProcessExec(route, route.catchs, match, ctx, err);
        } else {
            throw err;
        }
    }
    //4. 执行finally;
    await httpProcessExec(route, route.finallys, match, ctx);
}

module.exports = function (service) {
    service.options.log && Log.bindLog(service.options.log);
    process.on('message', function (event) {
        if (event == 'reload') {
            service.reload();
        }
    });
    process.on('unhandledRejection', (err) => {
        process.send({ event: 'error', message: 'unhandledRejection ' + err.message, stack: err.stack });
    });
    http.createServer(async (req, res) => {
        let ctx = new Context({ req, res, service });
        let uri = req.url.split('?')[0];
        try {
            await httpProcess(service.route, [], ctx, uri);
        } catch (err) {
            let unerror = 'Unknown Error !';
            ctx.sendHTML(err ? (err.stack || unerror) : unerror, 500);
        }
        if (!ctx.completed) {
            ctx.sendHTML('Not Found !', 404);
        }
    }).listen(service.options.p);
}
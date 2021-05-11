const os = require("os");
const Log = require("./lib/Log");
const cluster = require("cluster");
module.exports = function (service) {
    service.options.log && Log.bindLog(service.options.log);
    const countProcessesList = function () {
        let n = service.options.processes || os.cpus().length;
        return Array.apply([], '1'.repeat(Math.round(n * (service.options.processes_multiple || 1))).split(''));
    }
    const restart = function () {
        //1. 重新装在主进程事件处理逻辑
        service.reload();
        //2. 通知子进程重启
        Object.values(cluster.workers).forEach((work) => {
            work.process.kill();
        });
    };
    const reload = function () {
        //1. 重新装在主进程事件处理逻辑
        service.reload();
        //2. 通知子进程重新加载路由规则
        Object.values(cluster.workers).forEach((work) => {
            work.process.send('reload');
        });
    };

    const fork = function () {
        if (Object.keys(cluster.workers).length >= countProcessesList().length) {
            return;
        }
        cluster.fork().on('exit', fork).on('message', function (msg) {
            try {
                if (msg.event == 'reload') {
                    reload(), service.trigger(msg.event);
                } else if (msg.event == 'restart') {
                    restart();
                    let num = countProcessesList().length - Object.keys(cluster.workers).length;
                    while (num > 0) {
                        fork(), num--;
                    }
                    service.trigger(msg.event);
                } else if (msg.event == 'error') {
                    let err = new Error(msg.message);
                    err.stack = msg.stack;
                    service.trigger(msg.event, [err])
                } else {
                    console.info(msg);
                }
            } catch (err) {
                service.trigger('error', [err])
            }
        }).on('error', function (err) {
            service.trigger('error', [err])
        });
    };
    countProcessesList().forEach(fork);
}
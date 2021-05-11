const os = require("os");
const fs = require("fs");
const IDate = require("./IDate");
const writeLog = function (content, type, options) {
    let { path, level } = options;
    if (!path || (level && level.indexOf(type) == -1)) {
        return;
    }
    path.match(/{{([^}]+)}}/g).forEach(match => {
        path = path.replace(match, new IDate().format(match.substring(2, match.length - 2)));
    });
    if (content instanceof Error) {
        content = content.stack;
    }
    let pr = new IDate().format('yyyy-mm-dd hh:ii:ss') + ' [' + type + ']' + os.EOL
    fs.appendFile(path, pr + content + os.EOL, () => { });
};
const error = console.error;
const log = console.log;
const warn = console.warn;

exports.bindLog = function (options) {
    if (!options) {
        return;
    }
    global.console.error = function (...args) {
        error.apply(console, args);
        args.forEach((content) => writeLog(content, 'Error', options));
    };
    global.console.log = function (...args) {
        log.apply(console, args);
        args.forEach((content) => writeLog(content, 'Log', options));
    };
    global.console.warn = function (...args) {
        warn.apply(console, args);
        args.forEach((content) => writeLog(content, 'Warn', options));
    };
}

const loadlogEvents = function (service) {
    let info = [
        `> Master:${process.pid} ${os.hostname()} Events:`,
    ];
    Object.entries(service.events).forEach(([event, e]) => {
        //e.sys || info.push(['    >', event, e.name].join(' '));
        info.push(['    >', event, e.name].join(' '));
    });
    let data = info.join('\n');
    console.log(data);
    return data;
}
const loadlogRouter = function (service) {
    let route = service.route, options = service.options;
    let info = [
        `> Cluster:${process.pid} ${new IDate().format('yyyy-mm-dd hh:ii:ss')} port:${options.p} Routes:`,
    ];
    function getRoute(r, pf = 0) {
        pf && info.push([
            ' '.repeat(pf * 4) + '>',
            r.procedures.length + r.catchs.length,
            `[${r.method ? r.method.join(',') : '*'}]`,
            r.expression || '/',
        ].join(' '));
        r.ChildenRouters.forEach((route) => getRoute(route, pf + 1))
    }
    getRoute(route);
    let data = info.join('\n');
    console.log(data);
    return data;
};
exports.loadlogEvents = loadlogEvents;
exports.loadlogRouter = loadlogRouter;
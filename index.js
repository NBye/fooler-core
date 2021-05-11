const IDate = require('./src/lib/IDate');
const os = require('os');
exports.Fooler = require('./src/Fooler');
exports.loadlogEvents = function (service) {
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
exports.loadlogRouter = function (service) {
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
exports.IDate = IDate;
exports.Storage = require('./src/lib/Storage');
exports.Utils = require('./src/lib/Utils');
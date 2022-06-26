const os = require("os");
const fs = require("fs");
const IDate = require("./IDate");
const Path = require("path");
const writeLog = async function (args, type, env, conf) {
    let path = conf.path;
    path.match(/{{([^}]+)}}/g).forEach(match => {
        path = path.replace(match, new IDate().format(match.substring(2, match.length - 2)));
        path = path.replace('env', env);
    });
    let content = '';
    if (typeof conf[type] == 'function') {
        content = await conf[type](...args);
        content += os.EOL;
    } else {
        args.forEach(c => {
            if (c instanceof Error) {
                content += c.stack + os.EOL;
            } else if (c === null || c === undefined) {
                content += c + os.EOL;
            } else if (typeof c === 'object') {
                content += JSON.stringify(c) + os.EOL;
            } else {
                content += c + os.EOL;
            }
        });
    }
    let pr = new IDate().format('yyyy-mm-dd hh:ii:ss') + ' [' + (type.toUpperCase()) + ']' + os.EOL
    path = Path.normalize(path);
    let file = '';
    Path.dirname(path).split('/').forEach(m => {
        file += '/' + m;
        try {
            fs.mkdirSync(file);
        } catch (e) { }
    });
    fs.appendFile(path, pr + content, (err) => {
        err && warn(err.message, pr + content);
    });
};
const backs = {};
const warn = console.warn;
exports.bindLog = function (options) {
    if (!options || !options.log || !options.log.path) {
        return;
    }
    let { log, env } = options;
    let lives = log.level || ['error', 'log', 'warn', 'info'];
    lives.forEach((type) => {
        backs[type] = console[type];
        if (!backs[type]) {
            warn(`warn live ${type} is not defined!`);
        } else {
            global.console[type] = function (...args) {
                try {
                    writeLog(args, type, env, log);
                } catch (e) {
                    warn('warn writeLog:', e)
                }
                return backs[type].apply(console, args);
            };
        }
    });

}

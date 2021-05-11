const os = require("os");
const fs = require("fs");
const IDate = require("./IDate");
const writeLog = async function (args, type, options) {
    let { path, level } = options;
    if (!path || (level && level.indexOf(type) == -1)) {
        return;
    }
    path.match(/{{([^}]+)}}/g).forEach(match => {
        path = path.replace(match, new IDate().format(match.substring(2, match.length - 2)));
    });
    let content = '';
    if (typeof options[type] == 'function') {
        content = await options[type].apply(console, args);
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
    fs.appendFile(path, pr + content, () => { });
};
const error = console.error;
const log = console.log;
const warn = console.warn;

exports.bindLog = function (options) {
    if (!options || !options.path) {
        return;
    }
    global.console.error = function (...args) {
        writeLog(args, 'error', options);
        return error.apply(console, args);
    };
    global.console.log = async function (...args) {
        writeLog(args, 'log', options);
        return log.apply(console, args);
    };
    global.console.warn = async function (...args) {
        writeLog(args, 'warn', options);
        return warn.apply(console, args);
    };
}

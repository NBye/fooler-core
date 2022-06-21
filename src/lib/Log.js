const os = require("os");
const fs = require("fs");
const IDate = require("./IDate");
const writeLog = async function (args, type, options) {
    let path = options.path;
    path.match(/{{([^}]+)}}/g).forEach(match => {
        path = path.replace(match, new IDate().format(match.substring(2, match.length - 2)));
    });
    let content = '';
    if (typeof options[type] == 'function') {
        content = await options[type](...args);
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
const backs = {};
const warn = console.warn;
exports.bindLog = function (options) {
    if (!options || !options.path) {
        return;
    }
    let lives = options.level || ['error', 'log', 'warn', 'info'];
    lives.forEach((type) => {
        backs[type] = console[type];
        if (!backs[type]) {
            warn(`warn live ${type} is not defined!`);
        } else {
            global.console[type] = function (...args) {
                try {
                    writeLog(args, type, options);
                } catch (e) {
                    warn('warn writeLog:', e)
                }
                return backs[type].apply(console, args);
            };
        }
    });

}

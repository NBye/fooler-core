const fs = require('fs');
const getData = function (data, key) {
    key && key.split('.').forEach(k => {
        if (typeof data == 'object' && data[k] != 'undefined') {
            data = data[k];
        }
    });
    return data;
}
const cache = {};
exports.get = function (options, key) {
    let { root, env, conf } = options;
    let cache_name = `${env}-${conf}`;
    if (!cache[cache_name]) {
        let path = "";
        if (conf[0] == '.') {
            path += `${root}/${conf}`;
        } else {
            path += conf;
        }
        path.match(/{{([^}]+)}}/g).forEach(match => {
            path = path.replace('{{env}}', env);
        });
        cache[cache_name] = JSON.parse(fs.readFileSync(path));
    }
    return getData(cache[cache_name], key);
}
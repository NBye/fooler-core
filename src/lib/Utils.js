const xml2js = require('xml2js');

const foreach = function (data, callback, self) {
    if (!data) {

    } else if (data.length === undefined) {
        for (let k in data) {
            if (callback.call(self, data[k], k) === true) {
                return data[k];
            }
        }
    } else {
        for (let i = 0; i < data.length; i++) {
            if (callback.call(self, data[i], i) === true) {
                return data[i];
            }
        }
    }
};
const httpGetTrf = function (dd, kk) {
    let ks = [], kl = 0, vs = [];
    if (typeof dd == 'object' && !Array.isArray(dd)) {
        for (let k in dd) {
            let i = parseInt(k);
            if (typeof dd[k] == 'object') {
                foreach(dd[k], httpGetTrf, dd[k]);
            }
            if (/^[0-9]+$/.test(k) && (k[0] !== '0' || k === '0') && ks.indexOf(i) < 0) {
                ks.push(i);
            }
            kl += 1, vs.push(dd[k]);
        }
        ks.sort();
        ks.length === kl && ks[0] === 0 && ks[kl - 1] === kl - 1 && (this[kk] = vs);
    }
};
const httpBuildQuery = function (data, p) {
    let querys = [];
    for (let k in data) {
        if (typeof data[k] === 'object') {
            querys.push(httpBuildQuery(data[k], p ? p + '[' + k + ']' : k));
        } else if (typeof data[k] === 'string' || typeof data[k] === 'number') {
            querys.push((p ? p + '[' + k + ']' : k) + '=' + encodeURIComponent(data[k]));
        }
    }
    return querys.join('&');
};
const httpBuildUrl = function (url, data) {
    let query = httpBuildQuery(data);
    if (query) {
        return url + (url.indexOf('?') > -1 ? '&' : '?') + httpBuildQuery(data);
    } else {
        return url;
    }
};
const httpUrlArgs = function (url) {
    let urli = url.indexOf('?');
    let data = {}, sear = urli > -1 ? url.substr(urli + 1) : '';
    foreach(sear ? sear.split('&') : [], function (t) {
        let td = data;
        let ps = [];
        let pi = t.indexOf('=');
        if (pi < 0) {
            ps = [t, ''];
        } else {
            ps = [t.substr(0, pi), t.substr(pi + 1)];
        }
        if (ps[0]) {
            let ks = ps[0].match(/\[([^]]*)\]/g);
            let nm = '[' + ps[0].match(/^[^[]+/)[0] + ']';
            let vs = decodeURIComponent(ps[1]);
            ks ? (ks.unshift(nm)) : (ks = [nm]);
            foreach(ks, function (k, i) {
                k = k.substring(1, k.length - 1);
                td[k] || (td[k] = (i === ks.length - 1) ? vs : {});
                td = td[k];
            });
        }
    });
    foreach(data, httpGetTrf, data);
    return data;
};

const httpParseCookie = function (req) {
    if (!req._cookie_data) {
        let cookie = {}
        if (req.headers.cookie) {
            req.headers.cookie.split(';').forEach(item => {
                let [key, val] = item.trim().split('=');
                cookie[key.trim()] = val.trim();
            });
        }
        req._cookie_data = cookie;
    }
    return req._cookie_data;
};
const httpParseQuery = function (req) {
    if (!req._query_data) {
        req._query_data = httpUrlArgs(req.url);
    }
};
const httpParseRequest = function (req) {
    if (req._buff_content) {
        let post = {}, files = {};
        if (/json/i.test(req.headers['content-type'])) {
            post = JSON.parse(req._buff_content.toString());
        } else if (/xml/i.test(req.headers['content-type'])) {
            let parser = new xml2js.Parser({
                explicitArray: false, ignoreAttrs: true
            });
            parser.parseString(req._buff_content.toString(), (err, ret) => {
                err ? (post = {}) : (post = ret.xml);
            });
        } else if (/x-www-form-urlencoded/.test(req.headers['content-type'])) {
            post = httpUrlArgs('?' + req._buff_content.toString());
        } else if (/form-data/.test(req.headers['content-type'])) {
            let boundary = req.headers['content-type'].match(/boundary=([^ ;]+)/)[1];
            let current, buff, i = 0, EOL = Buffer.from('\r\n'); //os.EOL 在linux 下不兼容
            while (i > -1) {
                i = req._buff_content.indexOf(EOL);
                if (i < 0) {
                    buff = req._buff_content;
                    req._buff_content = null;
                } else {
                    buff = req._buff_content.slice(0, i);
                    req._buff_content = req._buff_content.slice(i + EOL.length);
                }
                let line = buff.toString();
                if (line.indexOf(boundary) > -1) {
                    current = { 'data': null };
                } else if (/Content-Disposition/.test(line)) {
                    line.match(/([^ "]+)="([^ "]+)"/g).forEach(match => {
                        let [_, key, val] = match.match(/([^ "]+)="([^ "]+)"/);
                        current[key] = val;
                    });
                    if (current.filename) {
                        files[current.name] = current;
                    } else {
                        post[current.name] = current;
                    }
                } else if (/Content-Type/.test(line)) {
                    current['type'] = line.match(/Content-Type:\s*(.*)/)[1];
                } else if (line && !current['data']) {
                    current['data'] = buff;
                } else if (line) {
                    current['data'] = Buffer.concat([current['data'], EOL, buff]);
                }
            }
            let data = {};
            Object.values(post).forEach(o => data[o.name] = o.data.toString());
            post = data;
        } else {
            post = req._buff_content.toString();
        }
        req._buff_content = null;
        req._post_data = post;
        req._file_data = files;
    }
};
const httpOnData = async function (req) {
    return new Promise((resolve, reject) => {
        let buff = Buffer.from('');
        req.on('data', (chunk) => {
            buff = Buffer.concat([buff, chunk]);
        });
        req.on('end', () => {
            req._buff_content = buff;
            resolve();
        });
        req.on('error', () => {
            reject(err);
        });
    });
}

const getData = function (data, key) {
    key && key.split('.').forEach(k => {
        if (typeof data == 'object' && data[k] != 'undefined') {
            data = data[k];
        }
    });
    return data;
}
const setData = function (data, key, val) {
    let obj = data, path = [], keys = key.split('.');
    while (keys.length) {
        let key = keys.shift();
        if (typeof obj !== 'object') {
            throw new Error(`data(${JSON.stringify(data)}) path(${path.join('.')}) Is Not Object !`);
        } else if (obj[key] == undefined) {
            obj[key] = {};
        }
        keys.length ? (obj = obj[key]) : (obj[key] = val);
        path.push(key);
    };
    return data;
}


exports.httpBuildQuery = httpBuildQuery;
exports.httpBuildUrl = httpBuildUrl;
exports.httpUrlArgs = httpUrlArgs;
exports.httpParseCookie = httpParseCookie;
exports.httpParseQuery = httpParseQuery;
exports.httpParseRequest = httpParseRequest;
exports.httpOnData = httpOnData;
exports.getData = getData;
exports.setData = setData;

const { getData, httpParseCookie } = require('./Utils');

class Cookie {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    set(key, value, options = {}) {
        let str = `${key}=${value};`;
        let set = Object.assign({
            'httpOnly': true,
            'path': '/',
            // 'expires':'',
            // 'domain': '',
            // 'max-age': 3600 * 24,
        }, options);
        Object.entries(set).forEach(([k, v]) => {
            str += v == true ? `${k};` : `;${k}=${v};`;
        });
        this.res.setHeader('Set-Cookie', str);
    }
    get(key) {
        return getData(httpParseCookie(this.req), key);
    }
}
module.exports = Cookie;
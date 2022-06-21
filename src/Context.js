const { httpParseQuery, getData } = require('./lib/Utils');
const Storage = require('./lib/Storage');
const Cookie = require('./lib/Cookie');

class Context {
    res = null;
    req = null;
    completed = false;
    constructor({ req, res, service }) {
        this.req = req;
        this.res = res;
        this.service = service;
        this.options = service.options;
        this.data = new Storage();
        this.cookie = new Cookie(req, res);
    }
    GET(key) {
        httpParseQuery(this.req);
        return getData(this.req._query_data || {}, key);
    }
    POST(key) {
        return getData(this.req._post_data || {}, key);
    }
    FILES(key) {
        return getData(this.req._file_data || {}, key);
    }
    setHeader(name, value) {
        this.res.setHeader(name, value);
    }
    send({ text, status = 200, headers = {} }) {
        this.res.writeHead(status, headers);
        this.res.end(text);
        this.completed = true;
    }
    sendJSON(data, status = 200) {
        this.send({
            text: JSON.stringify(data),
            status,
            headers: { 'Content-type': 'application/json;charset=UTF-8' }
        });
    }
    sendHTML(html, status = 200) {
        this.send({
            text: html,
            status,
            headers: { 'Content-Type': 'text/html;charset=UTF8' }
        });
    }
}
module.exports = Context;
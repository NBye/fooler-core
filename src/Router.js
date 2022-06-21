class Router {
    expression = null;
    procedures = [];
    catchs = [];
    finallys = [];
    method = null;
    ChildenRouters = [];
    service = null;
    constructor(expression, method, service, domain) {
        this.expression = expression;
        this.method = method;
        this.service = service;
        this.host = domain;
    }

    do({ uri, method, domain, ctx }) {
        if (this.host instanceof RegExp && !this.host.test(domain)) {
            return false; //http domain 不匹配跳过
        } else if (typeof this.host == 'string' && this.host !== domain) {
            return false; //http domain 不一致跳过
        } else if (this.method && this.method.indexOf(method) < 0) {
            return false; //http method 未启用跳过
        } else if (this.expression instanceof RegExp) {
            let match = uri.match(this.expression);
            if (match) {
                match = Array.from(match);
                match.shift();
                return match;
            } else {
                return false; // 正则模式不匹配跳过
            }
        } else if (typeof this.expression == 'function') {
            let ret = this.expression({ uri, method, domain, ctx });
            return ret instanceof Array ? ret : (ret ? [] : false);
        } else if (uri.indexOf(this.expression) === 0) {
            if (this.ChildenRouters.length == 0 && this.expression != uri) {
                return false; //字符串子节点不能完全匹配跳过
            }
            return [];
        } else {
            return false;
        }
    }

    domain(domain) {
        let route = new Router('', null, this.service, domain);
        this.ChildenRouters.push(route);
        return route;
    }
    when(expression, method, domain) {
        //如果父子路由表达式都为字符串时，子路由拼接继承父路由表达式
        if (typeof expression == 'string' && typeof this.expression == 'string') {
            expression = this.expression + expression;
        }
        let route = new Router(expression, method, this.service, domain || this.host);
        this.ChildenRouters.push(route);
        return route;
    }
    childens(callback) {
        typeof callback === 'function' && callback(this);
        return this;
    }
    then(...procedures) {
        this.procedures = this.procedures.concat(procedures);
        return this;
    }
    catch(...procedures) {
        this.catchs = procedures.reverse().concat(this.catchs);
        return this;
    }
    finally(...procedures) {
        this.finallys = procedures.reverse().concat(this.finallys);
        return this;
    }

    GET(uri, domain) {
        return this.when(uri, ['GET'], domain);
    }
    POST(uri, domain) {
        return this.when(uri, ['POST'], domain);
    }
    OPTIONS(uri, domain) {
        return this.when(uri, ['OPTIONS'], domain);
    }
    DELETE(uri, domain) {
        return this.when(uri, ['DELETE'], domain);
    }
    PUT(uri, domain) {
        return this.when(uri, ['PUT'], domain);
    }
    HEAD(uri, domain) {
        return this.when(uri, ['HEAD'], domain);
    }
}
module.exports = Router;
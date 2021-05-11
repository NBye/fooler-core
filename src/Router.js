class Router {
    expression = null;
    procedures = [];
    catchs = [];
    finallys = [];
    method = null;
    ChildenRouters = [];
    service = null;
    constructor(expression, method, service) {
        this.expression = expression;
        this.method = method;
        this.service = service;
    }

    do(uri, method) {
        if (this.method && this.method.indexOf(method) < 0) {
            return false; //http method 不一致跳过
        } else if (this.expression instanceof RegExp) {
            let match = uri.match(this.expression);
            if (match) {
                match = Array.from(match);
                match.shift();
                return match;
            } else {
                return false; // 这则模式不匹配跳过
            }
        } else if (uri.indexOf(this.expression) === 0) {
            if (this.ChildenRouters.length == 0 && this.expression != uri) {
                return false; //字符串子节点不能完全匹配跳过
            }
            return [];
        } else {
            return false;
        }
    }
    when(expression, method) {
        //如果父子路由表达式都为字符串时，子路由拼接继承父路由表达式
        if (typeof expression == 'string' && typeof this.expression == 'string') {
            expression = this.expression + expression;
        }
        let route = new Router(expression, method);
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

    GET(uri) {
        return this.when(uri, ['GET']);
    }
    POST(uri) {
        return this.when(uri, ['POST']);
    }
    OPTIONS(uri) {
        return this.when(uri, ['OPTIONS']);
    }
    DELETE(uri) {
        return this.when(uri, ['DELETE']);
    }
    PUT(uri) {
        return this.when(uri, ['PUT']);
    }
    HEAD(uri) {
        return this.when(uri, ['HEAD']);
    }
}
module.exports = Router;
const cluster = require("cluster");
const Router = require('./Router');
const fs = require('fs');
const path = require('path');
const Utils = require('./lib/Utils');

class Fooler {
    options = { p: 80 };
    events = {};
    route = null;
    constructor(options) {
        if (options.root) {
            global.__root__ = options.root;
        } else {
            global.__root__ = path.dirname(process.argv[1]);
        }
        Object.assign(options, Utils.process_argv_parse());
        options.port && (options.p = options.port);
        Object.assign(this.options, options);
        this.route = new Router('', null, this);
    }

    async trigger(event, args) {
        try {
            if (this.events[event] && this.events[event].callback) {
                return await this.events[event].callback.apply(this, args);
            } else {
                return false;
            }
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async on(event, callback, alias) {
        if (typeof callback == 'function') {
            this.events[event] = {
                callback,
                name: alias || event,
                sys: ['reload', 'restart', 'info', 'error'].indexOf(event) > -1,
            };
        }
        return this;
    }

    async reload() {
        try {
            if (this.options.expand) {
                Object.assign(this.options, JSON.parse(fs.readFileSync(this.options.expand)));
            }
            //1. 清理require缓存
            for (let k in require.cache) {
                if (!/node_modules/.test(k)) {
                    delete require.cache[k];
                }
            }
            //2. 主进程重新装载事件
            if (this.options.event) {
                this.events = {};
                await require(this.options.event)(this);
            }
            //3. 子进程重新装在路由
            if (!cluster.isMaster && this.options.route) {
                this.route = new Router('', null, this, false);
                await require(this.options.route)(this.route);
                await this.trigger('load-events', [this], true);
                await this.trigger('load-router', [this], true);
            }
        } catch (err) {
            try {
                if (this.events.error) {
                    await this.events.error.callback(err);
                } else {
                    console.error(err);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }
    async run() {
        this.reload();
        if (cluster.isMaster) {
            require('./fooler-master')(this);
        } else {
            require('./fooler-cluster')(this);
        }
    }
    static create(options) {
        return new Fooler(options);
    }
}
module.exports = Fooler;
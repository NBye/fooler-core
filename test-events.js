const { loadlogRouter, loadlogEvents } = require('fooler-core');

module.exports = function (app) {
    app.on('error', async function (err) {
        console.error('on error:', err);
    }, '服务错误回调事件');
    app.on('restart', async function () {
        console.log('on restart');
    }, '服务被重启回调事件');
    app.on('reload', async function () {
        console.log('on reload');
    }, '服务被重载回调事件');
    app.on('load-events', async function (service) {
        loadlogEvents(service);
    }, '加载事件完成时');
    app.on('load-router', async function (service) {
        loadlogRouter(service);
    }, '加载路由完成时时');
}
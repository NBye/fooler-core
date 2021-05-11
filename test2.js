const { Fooler } = require('fooler-core');
const app = new Fooler({
    p: 8080
});
app.route.GET('/hello').then(({ ctx }) => {
    ctx.sendHTML('hello world');
})
app.run();
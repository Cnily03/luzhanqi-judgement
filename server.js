const env = (process.env.NODE_ENV || "production").trim();
const path = require("path");
const Koa = require("koa");
const bodyParser = require('koa-bodyparser');
const Router = require("koa-router");
const colors = require('colors');

const app = new Koa();
const port = 81;
const routes = {
    "/": "index",
    "/s/:sid": "s",
    "/operate": "operate"
}
const staticDir = env === "development" ? "./src" : "./public";
const viewsDir = env === "development" ? "./src/views" : "./views";

// colors
colors.setTheme({
    info: "cyan",
    success: "green",
    warn: "yellow",
    error: "red"
});

// static dir
const staticServer = require('koa-static');
app.use(staticServer(path.join(__dirname, staticDir)));

// views engine
const views = require("koa-views");
app.use(views(path.join(__dirname, viewsDir), {
    extension: 'ejs'
}))

// parse request data
app.use(bodyParser({
    enableTypes: ['json', 'form', 'text']
}));

// routes
Object.keys(routes).forEach(_key => {
    let _router = require("./routes/" + routes[_key]);
    app.use(_router.routes()).use(_router.allowedMethods());
});

// start the server
app.listen(port, function () {
    console.log(`Server is running at port ${port}...`.success);
})

module.exports = app;
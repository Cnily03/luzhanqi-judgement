const Router = require("koa-router");
const router = new Router();
const ws = require("nodejs-websocket");
const wsHandler = require("./s/wsHandler");
const chess = require("./s/chess");
const utils = require("./s/utils");
const updateLiveInfo = utils.updateLiveInfo;
const removeLiveInfo = utils.removeLiveInfo;
const sendWS = utils.sendWS;
const root = "/s";

global.ws = {};
global.ws.port = 7021;
global.ws.server = ws.createServer((conn) => {
    conn.on("text", (data) => wsHandler.onmessage(conn, data));
    conn.on("close", (code, reason) => wsHandler.onclose(conn, code, reason));
    conn.on("error", (code, reason) => wsHandler.onerror(conn, code, reason));
}).listen(global.ws.port);

global.onLiveSid = [];
global.livePlayInfo = {};
global.connections = {};

router.get(root + "/:sid", async (ctx, next) => {
    const sid = ctx.params.sid;
    const path = "/s/" + sid;
    if (!global.onLiveSid.includes(sid)) {
        return;
    }
    await ctx.render("s", {
        title: "进行中- 陆战棋暗棋",
        chess: chess.chessJson,
        sid: sid,
        url: "http://" + ctx.request.header.host + path,
        ws_port: global.ws.port
    });
})

module.exports = router;
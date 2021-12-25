const Router = require("koa-router");
const router = new Router();
const root = "/operate";
const updateLiveInfo = require("./s/utils").updateLiveInfo;
const cryption = require("./utils/cryption");

function genSid() {
    var _sid = "";
    let cryptoStr = cryption.hash(
        new Date().getTime().toString().slice(4),
        "md5", cryption.random(4)
    );
    cryptoStr = cryptoStr.split("").sort(() => {
        return parseInt(Math.random() * 2) * 2 - 1
    }).join("");
    let randomStr = cryption.random(16);
    for (let i = 0; i < 16; i++) {
        const index = parseInt(Math.random() * 3);
        const isUpper = parseInt(Math.random() * 2);
        const option = cryptoStr[i * 2] + cryptoStr[i * 2 + 1] + randomStr[i];
        _sid += isUpper ? option[index].toUpperCase() : option[index].toLowerCase();
    }
    return !global.onLiveSid.includes(_sid) ? _sid : genSid();
}

function isLegalSid(_sid) {
    if (_sid.length > 16 || _sid.length < 6 || !/^[0-9a-zA-Z]*$/.test(_sid))
        return false;
    else return true;
}

router.post(root + "/createRoom", async (ctx, next) => {
    const params = JSON.parse(ctx.request.body);
    params.sid = params.sid || "";
    params.sid = params.sid.toString();
    if (params.sid.length) { // sid is not empty
        if (!isLegalSid(params.sid)) {
            ctx.body = {
                connected: 1,
                error: {
                    code: "INVALID_SID",
                    message: "房间号必须由 6-16 位的数字或字母构成"
                },
                sid: "",
                url: ""
            }
            return;
        }
        if (global.onLiveSid.includes(params.sid)) {
            ctx.body = {
                connected: 1,
                error: {
                    code: "REPEATED_SID",
                    message: "房间号已存在！"
                },
                sid: params.sid,
                url: ""
            }
            return;
        }
    }
    // generate or var sid
    const sid = params.sid || genSid();
    updateLiveInfo(sid);
    ctx.body = {
        connected: 1,
        error: {},
        sid: sid,
        url: ctx.request.header.origin + "/s/" + sid
    }
})

router.post(root + "/getRoom", async (ctx, next) => {
    const params = JSON.parse(ctx.request.body);
    if (!isLegalSid(params.sid)) {
        ctx.body = {
            connected: 1,
            error: {
                code: "INVALID_SID",
                message: "房间号必须由 6-16 位的数字或字母构成"
            },
            sid: "",
            url: ""
        }
        return;
    }
    if (global.onLiveSid.includes(params.sid)) {
        ctx.body = {
            connected: 1,
            error: {},
            sid: params.sid,
            url: ctx.request.header.origin + "/s/" + params.sid
        }
    } else {
        ctx.body = {
            connected: 1,
            error: {
                code: "NO_SUCH_SID",
                message: "房间号不存在！"
            },
            sid: params.sid,
            url: ""
        }
    }
})

module.exports = router;
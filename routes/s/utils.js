const liveconfig = require("../../_server.config").live;
const defaultPlayInfo = {
    connections: [],
    teamIP: {
        black: [],
        red: []
    },
    resetReq: {
        black: false,
        red: false
    },
    selectedChess: {},
    deathCount: {
        black: {},
        red: {}
    }
};
const getTimeString = () => {
    return new Date().toTimeString().split(" ")[0];
}

function updateLastTime(sid) {
    global.livePlayInfo[sid].lastTime = new Date().getTime() / 1000;
}

function updateLiveInfo(sid) {
    if (!global.onLiveSid.includes(sid)) {
        global.livePlayInfo[sid] = JSON.parse(JSON.stringify(defaultPlayInfo));
        updateLastTime(sid);
        global.onLiveSid.push(sid);
        // interval
        global.livePlayInfo[sid].interval = setInterval(() => {
            const timeLong = new Date().getTime() / 1000 - global.livePlayInfo[sid].lastTime;
            const timeOutLong = global.livePlayInfo[sid].connections.length ?
                liveconfig.timeOut.hasConn : liveconfig.timeOut.emptyConn;
            if (timeLong >= timeOutLong) {
                clearInterval(global.livePlayInfo[sid].interval);
                removeLiveInfo(sid);
            }
        }, liveconfig.detectTimeOutInterval)
    }
}

function removeLiveInfo(sid) {
    for (let conn of global.livePlayInfo[sid].connections) conn.close();
    global.onLiveSid.splice(global.onLiveSid.indexOf(sid), 1);
    delete global.livePlayInfo[sid];
}

/**
 * Broadcast text via WebSocket.
 * @param {string} sid - It's used to confirm the proper connection.
 * @param {*} data - Data to send.
 * 
 * **Data Format**
 * - `:time | ` - it's on the beginning of the data.
 * - `vanilla: :string` - Show `:string` directly.
 * - `join: <black | red> :ip` - Tell that `:ip` joined the game.
 * - `leave: :ip` - Tell that `:ip` left the game.
 * - `team: <black | red> :ip` - Tell that `:ip` change the team to black or red.
 * - `select: <black | red> :ip` - Tell that `:ip` finished seleting.
 * - `win: <black | red>` - Tell that the winner is black or red.
 * - `reset: <on | off | reset> <black | red> :ip` - reset the game.
 * @returns {boolean} Whether it sent successfully.
 */
function sendWS(sid, data) {
    if (!global.onLiveSid.includes(sid)) return false;
    global.livePlayInfo[sid].connections.forEach(conn => {
        if (conn.path.split("/s/")[1] == sid) conn.sendText(`${getTimeString()} | ` + data)
    });
    return true;
}
/**
 * Send text via WebSocket.
 * @param {string} sid - It's used to confirm the proper connection.
 * @param {*} data - Data to send.
 * 
 * **Data Format**
 * - `local:team: <black | red> :chessid` - Tell changing into black or red team successfully, and set `:chessid` if exists.
 * - `local:error: :message` - Tell back error.
 */
function sendConn(conn, data) {
    conn.sendText(`${getTimeString()} | ` + data);
}

module.exports = {
    updateLastTime,
    updateLiveInfo,
    removeLiveInfo,
    sendWS,
    sendConn
}
const utils = require("./utils");
const updateLastTime = utils.updateLastTime;
const updateLiveInfo = utils.updateLiveInfo;
const sendConn = utils.sendConn;
const sendWS = utils.sendWS;
const chess = require("./chess");

const getSid = (conn) => {
    const _sid = conn.path.split("/s/")[1];
    return _sid;
}
const getIP = (conn) => {
    let __remoteIP = conn.socket.remoteAddress.split(":");
    const _ip = __remoteIP[__remoteIP.length - 1].split(".").length == 4 ?
        __remoteIP[__remoteIP.length - 1] : __remoteIP.join(":");
    return _ip;
}
/**
 * Receive and handle text via WebSocket.
 * @param {object} conn The connection object.
 * @param {string} sid The sid of the connection.
 * @param {string} ip Remote ip address.
 * @param {*} data Data received.
 * 
 * **Data Format**
 * - `join:` - Tell that `:ip` joined the game.
 * - `team: <black | red>` - Tell that `:ip` change the team to black or red.
 * - `select: <black | red> :chess` - Tell that black or red selected `:chess`.
 * - `reset: <on | off> <black | red>` - Black or red team wants to reset the game.
 */
const messageHandler = (conn, sid, ip, data) => {
    // push conn to the connection list;
    switch (true) {
        case /^join: /.test(data): {
            // push conn to the list
            if (!global.livePlayInfo[sid].connections.includes(conn))
                global.livePlayInfo[sid].connections.push(conn);
            // check if it has a team
            let _team;
            if (global.livePlayInfo[sid].teamIP["black"].includes(ip)) _team = "black";
            else if (global.livePlayInfo[sid].teamIP["red"].includes(ip)) _team = "red";
            else _team = "default";
            // send message
            sendWS(sid, `join: ${_team} ${ip}`);
            if (["black", "red"].includes(_team)) {
                let _chessid = global.livePlayInfo[sid].selectedChess[_team] || "none";
                let _isReset = global.livePlayInfo[sid].resetReq[_team] ? "1" : "0";
                sendConn(conn, `local:team: ${_team} ${_chessid} ${_isReset}`);
            };
            break;
        }
        case /^team: /.test(data): {
            const _team = (data.split("team: ")[1] || "").trim();
            // invalid data
            if (!["black", "red"].includes(_team)) {
                sendConn(conn, `local:error: team 无效的数据！`);
                return;
            }
            // already in the same the team
            if (global.livePlayInfo[sid].teamIP[_team].includes(ip)) {
                let _isReset = global.livePlayInfo[sid].resetReq[_team] ? "1" : "0";
                sendConn(conn, `local:team: ${_team} ${_isReset}`);
                return;
            };
            // clear ip in teamIP
            for (let __team of ["black", "red"])
                if (global.livePlayInfo[sid].teamIP[__team].includes(ip))
                    global.livePlayInfo[sid].teamIP[__team].splice(
                        global.livePlayInfo[sid].teamIP[__team].indexOf(ip), 1
                    )
            // push ip to teamIP
            global.livePlayInfo[sid].teamIP[_team].push(ip);
            // check if it has selectedChess
            let _chessid = global.livePlayInfo[sid].selectedChess[_team] || "none";
            let _isReset = global.livePlayInfo[sid].resetReq[_team] ? "1" : "0";
            // sned message
            sendConn(conn, `local:team: ${_team} ${_chessid} ${_isReset}`);
            sendWS(sid, `team: ${_team} ${ip}`);
            break;
        }
        case /^select: /.test(data): {
            let _dataArr = (data.split("select: ")[1] || "").trim().split(" ")
            const _team = (_dataArr[0] || "").trim();
            const _chessid = (_dataArr[1] || "").trim();
            // invalid data
            if (!["black", "red"].includes(_team) || !chess.chessIDs.includes(_chessid)) {
                sendConn(conn, `local:error: select 无效的数据！`);
                return;
            }
            // store the chess
            global.livePlayInfo[sid].selectedChess[_team] = _chessid;
            // send message
            sendWS(sid, `select: ${_team} ${ip}`);
            // judge the winner
            if (Object.keys(global.livePlayInfo[sid].selectedChess).length == 2) {
                let _winner = chess.judgeWinner(
                    global.livePlayInfo[sid].selectedChess["black"],
                    global.livePlayInfo[sid].selectedChess["red"],
                    sid
                );
                // count failed chess
                for (let __team of ["black", "red"])
                    if ([(__team == "black" ? "red" : "black"), "bothdie"].includes(_winner)) {
                        global.livePlayInfo[sid].deathCount[__team][
                            global.livePlayInfo[sid].selectedChess[__team]
                        ] = global.livePlayInfo[sid].deathCount[__team][
                            global.livePlayInfo[sid].selectedChess[__team]
                        ] || 0;
                        global.livePlayInfo[sid].deathCount[__team][
                            global.livePlayInfo[sid].selectedChess[__team]
                        ]++;
                    }
                // send message
                sendWS(sid, `win: ${_winner}`);
                // special situation: detect msgDeliver.chess
                switch (global.msgDeliver.chess) {
                    // if junqi was boomed
                    case "junqi-boom:black": {
                        sendWS(sid, `vanilla: :junqi-boom:black`);
                        break;
                    }
                    case "junqi-boom:red": {
                        sendWS(sid, `vanilla: :junqi-boom:red`);
                        break;
                    }
                    // if junqi was held
                    case "junqi-holder:black": {
                        sendWS(sid, `vanilla: :junqi-holder:black`);
                        break;
                    }
                    case "junqi-holder:red": {
                        sendWS(sid, `vanilla: :junqi-holder:red`);
                        break;
                    }
                }
                // reset selectedChess
                global.livePlayInfo[sid].selectedChess = {};
            }
            break;
        }
        case /^reset: /.test(data): {
            let _dataArr = (data.split("reset: ")[1] || "").trim().split(" ")
            const _operate = (_dataArr[0] || "").trim();
            const _team = (_dataArr[1] || "").trim();
            // invalid data
            if (!["black", "red"].includes(_team) || !["on", "off"].includes(_operate)) {
                sendConn(conn, `local:error: reset 无效的数据！`);
                return;
            }
            // record it
            if (_operate == "on") global.livePlayInfo[sid].resetReq[_team] = true;
            else if (_operate == "off") global.livePlayInfo[sid].resetReq[_team] = false;
            // check whether to reset and send message
            sendWS(sid, `reset: ${_operate} ${_team} ${ip}`);
            if (global.livePlayInfo[sid].resetReq["black"] && global.livePlayInfo[sid].resetReq["red"]) {
                global.livePlayInfo[sid].resetReq = {};
                global.livePlayInfo[sid].selectedChess = {};
                global.livePlayInfo[sid].deathCount = {
                    black: {},
                    red: {}
                };
                sendWS(sid, `reset: reset . .`);
            }
            break;
        }
    }
}

const onmessage = (conn, data) => {
    const sid = getSid(conn),
        ip = getIP(conn);
    // If onLiveSid has no this sid, then close and quit.
    if (!global.onLiveSid.includes(sid)) {
        conn.close();
        return;
    }
    // update last time
    updateLastTime(sid);
    // message handler
    messageHandler(conn, sid, ip, data);
    console.log(global.livePlayInfo[sid]); // DEBUG
}

const onclose = (conn, code, reason) => {
    const sid = getSid(conn),
        ip = getIP(conn);
    // If onLiveSid has no this sid, then quit.
    if (!global.onLiveSid.includes(sid)) return;
    // update last time
    updateLastTime(sid);
    // Remove connections.
    if (global.livePlayInfo[sid].connections.includes(conn))
        global.livePlayInfo[sid].connections.splice(
            global.livePlayInfo[sid].connections.indexOf(conn), 1
        );
    // Broadcast
    sendWS(sid, `leave: ${ip}`);
    console.log(global.livePlayInfo[sid]); // DEBUG
    // After removing, if there's no connections...
    // if (global.livePlayInfo[sid].connections.length == 0) {};
}

const onerror = (conn, code, reason) => {
    const sid = getSid(conn),
        ip = getIP(conn);
}

module.exports = {
    onmessage,
    onclose,
    onerror
}
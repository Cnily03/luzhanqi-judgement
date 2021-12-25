window.console.debug = function () {
    window.isEnvDev ? window.console.log(...arguments) : function () {}
};

const messages = {
    parse: function (str) {
        for (let i = 1; i < arguments.length; i++) {
            const single = arguments[i];
            if (arguments.length == 2) str = str.replace(RegExp("%s", "g"), single)
            str = str.replace(RegExp("%" + i.toString() + "s", "g"), single)
        }
        return str;
    },
    vanilla: {
        ":junqi-boom:black": "<font color='#000'>黑棋</font> 军旗被炸！",
        ":junqi-boom:red": "<font color='#f00'>红棋</font> 军旗被炸！",
        ":junqi-holder:black": "<font color='#f00'>红棋</font> 军旗被 <font color='#000'>黑棋</font> 夺去！",
        ":junqi-holder:red": "<font color='#000'>黑棋</font> 军旗被 <font color='#f00'>红棋</font> 夺去！"
    },
    join: "%1s 加入了房间。",
    leave: "%1s 离开了房间。",
    team: "%1s 加入了 %2s 阵营。",
    select: "%1s 选择 %2s 完毕。",
    reset_on: "%1s（%2s）请求重置游戏，双方均发起请求将重置游戏。",
    reset_off: "%1s（%2s）取消了重置游戏的请求。",
    reset_reset: "游戏重置成功！",
    winner_head: "判定结果：%1s",
    winner: {
        black: "%2s 战败，%1s 略胜一筹。",
        red: "%2s 战败，%1s 略胜一筹。",
        bothdie: "同归于尽！",
        invalid: "吃子无效，继续对峙！",
        allwin: "游戏结束，%1s获胜！",
        error: "输入错误！"
    }
}

const CONFIG = {
    name: {
        resetGame: "reset-game"
    },
    id: {
        messageBox: "message-box"
    },
    class: {
        activeTeam: "team-selected",
            activeChess: "chess-selected",
            oneMessage: "one-message",
            messageTime: "message-time"
    }
}
const reflex = {
    entozh: {
        "black": "黑棋",
        "red": "红棋"
    },
    zhtoen: {
        "黑棋": "black",
        "红棋": "red"
    },
    entozh_color: {
        "black": "<font color='#000'>黑棋</font>",
        "red": "<font color='#f00'>红棋</font>"
    },
    colormap: {
        "black": "#000",
        "red": "#f00",
        "default": "#0078d4", // blue
        "bothdie": "#32b643", // green
        "invalid": "#32b643", // green
        "error": "#fc9a03" // yellow
    },
    colorifyText: (str, teamOrColor) => {
        return `<font color='${teamOrColor.includes("#") ? teamOrColor : reflex.colormap[teamOrColor]}'>` +
            str + `</font>`;
    }
}
var globalTeam = "default";

/* ----------------------------------------------------- */

const updateTeam = (_team = globalTeam) => {
    globalTeam = _team;
    const _dom = document.querySelector(".select-team #" + globalTeam);
    const _dom_oppsite = document.querySelector(
        ".select-team #" + {
            "black": "red",
            "red": "black"
        } [globalTeam]
    );
    _dom.classList.add(CONFIG.class.activeTeam);
    _dom_oppsite.classList.remove(CONFIG.class.activeTeam);
    document.querySelector(".chess-board").classList.remove("disabled");
    document.documentElement.style.setProperty('--team-color', reflex.colormap[globalTeam]);
}

const setResetGameStatus = function (isReset) {
    document.querySelector(`input[name='${CONFIG.name.resetGame}']`).checked = !!isReset;
}

const resetGame = () => {
    // reset select-chess
    changeToWaitChess();
    // reset reset-game
    setResetGameStatus(false);
}

const changeToWaitChess = () => {
    // store back isOnSubmit
    window.isOnSubmit = false;
    document.querySelector("#submit-chess").style.pointerEvents = "all";
    // reset select-chess
    for (let _dom of document.querySelectorAll("#chess .chess-btn"))
        _dom.classList.remove(CONFIG.class.activeChess);
}

const messageBox = {
    element: null,
    clear: () => {
        messageBox.element.innerHTML = "";
    },
    append: (time, message, color = "default") => {
        let _node = document.createElement("div");
        let _node_time = document.createElement("div");
        _node.classList.add(CONFIG.class.oneMessage);
        _node.classList.add("tag-" + color);
        _node_time.classList.add(CONFIG.class.messageTime);
        _node_time.innerHTML = `[${time}] `;
        _node.appendChild(_node_time);
        _node.innerHTML += message;
        messageBox.element.appendChild(_node);
        document.querySelector("#message-box").scrollTop = document.querySelector("#message-box").scrollHeight;
    }
}

const wsHandler = () => {
    window.ws = new WebSocket("ws://" + window.ws_url);
    ws.onopen = (e) => {
        ws.send("join: ");
    }
    ws.onclose = (e) => {
        messageBox.append(new Date().toTimeString().split(" ")[0], "连接超时，已断开连接。")
    }
    ws.onmessage = (e) => {
        const time = e.data.split(" | ")[0];
        const data = e.data.split(" | ")[1];
        messageHandler(time, data);
    }
}

const messageHandler = (time, data) => {
    console.debug(data);
    switch (true) {
        case /^vanilla: /.test(data): {
            let _msg = data.split("vanilla: ")[1].trim();
            if (Object.keys(messages.vanilla).includes(_msg))
                messageBox.append(time, messages.vanilla[_msg]);
            else messageBox.append(time, _msg);
            break;
        }
        case /^local:error: /.test(data): {
            let _dataArr = data.split("local:error: ")[1].trim().split(" ");
            let _type = _dataArr[0].trim(),
                _msg = _dataArr[1].trim();
            if (["select"].includes(_type)) changeToWaitChess();
            break;
        }
        case /^join: /.test(data): {
            let _dataArr = data.split("join: ")[1].trim().split(" ");
            let _team = _dataArr[0].trim(),
                _ip = _dataArr[1].trim();
            let _msg = messages.parse(
                messages.join, reflex.colorifyText(_ip, _team)
            );
            messageBox.append(time, _msg);
            break;
        }
        case /^leave: /.test(data): {
            let _ip = data.split("leave: ")[1].trim();
            let _msg = messages.parse(messages.leave, _ip);
            messageBox.append(time, _msg);
            break;
        }
        case /^team: /.test(data): {
            let _dataArr = data.split("team: ")[1].trim().split(" ");
            let _team = _dataArr[0].trim(),
                _ip = _dataArr[1].trim();
            let _msg = messages.parse(
                messages.team, reflex.colorifyText(_ip, _team), reflex.entozh_color[_team]
            );
            messageBox.append(time, _msg);
            break;
        }
        case /^local:team: /.test(data): {
            let _dataArr = data.split("local:team: ")[1].trim().split(" ");
            let _team = _dataArr[0].trim(),
                _chessid = _dataArr[1].trim(),
                _isReset = _dataArr[2].trim();
            updateTeam(_team);
            changeToWaitChess();
            // chess btn
            if (_chessid != "none")
                document.querySelector("#chess .chess-btn#" + _chessid).click();
            // reset btn
            setResetGameStatus(!!parseInt(_isReset));
            break;
        }
        case /^select: /.test(data): {
            let _dataArr = data.split("select: ")[1].trim().split(" ");
            let _team = _dataArr[0].trim(),
                _ip = _dataArr[1].trim();
            let _msg = messages.parse(
                messages.select, reflex.colorifyText(_ip, _team), reflex.entozh_color[_team]
            )
            messageBox.append(time, _msg);
            break;
        }
        case /^win: /.test(data): {
            let _winner = data.split("win: ")[1].trim();
            let _msg;
            if (["black", "red"].includes(_winner))
                _msg = messages.parse(
                    messages.winner_head,
                    messages.parse(
                        messages.winner[_winner],
                        reflex.entozh_color[_winner],
                        reflex.entozh_color[{
                            "black": "red",
                            "red": "black"
                        } [_winner]]
                    )
                );
            else if (_winner == "bothdie")
                _msg = messages.parse(
                    messages.winner_head, reflex.colorifyText(messages.winner["bothdie"], "bothdie")
                );
            else if (_winner == "invalid")
                _msg = messages.parse(
                    messages.winner_head, reflex.colorifyText(messages.winner["invalid"], "invalid")
                );
            else if (_winner.split(":")[0] == "allwin") // game over
                _msg = messages.parse(
                    messages.winner.allwin,
                    reflex.entozh_color[_winner.split(":")[1]]
                ), resetGame();
            else if (_winner == "error") { // input error
                _msg = reflex.colorifyText(messages.winner[_winner], _winner);
            }
            messageBox.append(time, _msg);
            changeToWaitChess();
            break;
        }
        case /^reset: /.test(data): {
            let _dataArr = data.split("reset: ")[1].trim().split(" ");
            let _operate = _dataArr[0].trim(),
                _team = _dataArr[1].trim(),
                _ip = _dataArr[2].trim();
            if (_operate == "reset") {
                resetGame();
            } else if (globalTeam == _team) {
                document.querySelector(`input[name='${CONFIG.name.resetGame}']`).checked = {
                    "on": true,
                    "off": false
                } [_operate];
            }
            let _msg = messages.parse(
                messages["reset_" + _operate],
                reflex.colorifyText(_ip, _team), reflex.entozh_color[_team]
            )
            messageBox.append(time, _msg);
            break;
        }
    }
}

/* ----------------------------------------------------- */

if (!window.WebSocket)
    document.write("该浏览器不支持 WebSocket<br>This browser does not support WebSocket.");

document.addEventListener("DOMContentLoaded", () => {
    // copy event
    const doms_copyBtn = document.querySelectorAll("#info #copy-btn");
    for (let i = 0; i < doms_copyBtn.length; i++) {
        const _dom = doms_copyBtn[i];
        _dom.onclick = () => {
            if (_dom.classList.contains("oncopy")) return;
            setClipboard(
                _dom.parentElement.previousElementSibling.children[0].value,
                "text",
                (isSupport) => {
                    if (isSupport) {
                        _dom.innerHTML = "复制成功";
                        _dom.classList.add("oncopy");
                        setTimeout(() => {
                            _dom.innerHTML = "复制";
                            _dom.classList.remove("oncopy");
                        }, 1000);
                    } else {
                        if (!window._runClipboard) {
                            alert(
                                "你的浏览器不支持自动复制，请手动复制。"
                            );
                            window._runClipboard = true;
                        }
                        _dom.parentElement.previousElementSibling.children[0].select();
                        _dom.innerHTML = "已选中";
                        _dom.classList.add("oncopy");
                        setTimeout(() => {
                            _dom.innerHTML = "选中";
                            _dom.classList.remove("oncopy");
                        }, 1000);
                    }
                }
            )
        }
    }
    // message-box
    messageBox.element = document.querySelector("#" + CONFIG.id.messageBox);
    // WebSocket
    window.ws_url = document.querySelector("#_ws-url").innerHTML;
    document.body.removeChild(document.querySelector("#_ws-url"));
    wsHandler();
    // select team
    for (let _dom of document.querySelector(".select-team").children) {
        _dom.onclick = () => {
            ws.send(`team: ${_dom.id}`);
        }
    }
    // reset game
    document.querySelector(`input[name='${CONFIG.name.resetGame}']`).onchange = () => {
        const checkedStatus = document.querySelector(`input[name='${CONFIG.name.resetGame}']`).checked;
        if (globalTeam == "default") {
            document.querySelector(`input[name='${CONFIG.name.resetGame}']`).checked = !checkedStatus;
            return;
        }
        let _operate = {
            "true": "on",
            "false": "off"
        } [checkedStatus.toString()];
        ws.send(`reset: ${_operate} ${globalTeam}`);
    }
    // select chess
    window.isOnSubmit = false;
    for (let _dom of document.querySelectorAll("#chess .chess-btn")) {
        _dom.onclick = () => {
            if (window.isOnSubmit) return;
            if (_dom.classList.contains(CONFIG.class.activeChess)) {
                _dom.classList.remove(CONFIG.class.activeChess);
                return;
            }
            for (let __dom of document.querySelectorAll("#chess .chess-btn"))
                __dom.classList.remove(CONFIG.class.activeChess);
            _dom.classList.add(CONFIG.class.activeChess);
        }
    }
    // submit
    document.querySelector("#submit-chess").onclick = () => {
        const _dom = document.querySelector("#chess .chess-btn." + CONFIG.class.activeChess);
        if (window.isOnSubmit || _dom === null) return;
        window.isOnSubmit = true;
        document.querySelector("#submit-chess").style.pointerEvents = "none";
        const _chessid = _dom.id;
        ws.send(`select: ${globalTeam} ${_chessid}`);
    }
})
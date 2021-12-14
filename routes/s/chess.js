const chessJson = {
    "siling": "司令",
    "junzhang": "军长",
    "shizhang": "师长",
    "lvzhang": "旅长",
    "tuanzhang": "团长",
    "yingzhang": "营长",
    "lianzhang": "连长",
    "paizhang": "排长",
    "gongbing": "工兵",
    "zhadan": "炸弹",
    "dilei": "地雷",
    "junqi": "军旗"
};
const chessIDs = Object.keys(chessJson);

/**
 * Judge who is the winner.
 * @param {string} blackId The black chess ID.
 * @param {string} redId  The red chess ID.
 * @returns {string} `black` | `red` | `bothdie` | `invalid` | `error` | `allwin:black` | `allwin:red`
 */
const judgeWinner = (blackId, redId, sid) => {
    const notHuman = ["zhadan", "dilei", "junqi"];
    if (!notHuman.includes(blackId) && !notHuman.includes(redId)) {
        // only human
        if (chessIDs.indexOf(blackId) < chessIDs.indexOf(redId)) return "black";
        if (chessIDs.indexOf(blackId) > chessIDs.indexOf(redId)) return "red";
        if (chessIDs.indexOf(blackId) == chessIDs.indexOf(redId)) return "bothdie";
    } else if (blackId != "junqi" && redId != "junqi") {
        // no junqi
        if (blackId == "zhadan" || redId == "zhadan") return "bothdie"; // one is zhadan
        if (blackId == "dilei" && redId == "dilei") return "error"; // both dilei -> error
        if (
            (blackId == "dilei" && redId == "gongbing") ||
            (blackId == "gongbing" && redId == "dilei")
        ) return blackId == "gongbing" ? "black" : "red"; // gongbing eat dilei
        if (blackId == "dilei" || redId == "dilei") return blackId == "dilei" ? "black" : "red"; // boom!
    } else {
        // one is junqi
        if (blackId == "junqi" && redId == "junqi") return "error"; // both junqi -> error
        if (
            (blackId == "junqi" && redId == "dilei") ||
            (blackId == "dilei" && redId == "junqi")
        ) return "error"; // junqi & dilei -> error
        if (
            (blackId == "junqi" && redId == "zhadan") ||
            (blackId == "zhadan" && redId == "junqi")
        ) return "bothdie"; // junqi & zhadan -> bothdie -> game rule changed
        if (
            (blackId == "junqi" && redId == "gongbing") ||
            (blackId == "gongbing" && redId == "junqi")
        ) return "invalid"; // gongbing cannot hold junqi
        if (blackId == "junqi" && global.livePlayInfo[sid].count["black"]["dilei"] >= 3)
            return "red"; // 3 dilei have been cleaned, junqi could be held
        else if (redId == "junqi" && global.livePlayInfo[sid].count["red"]["dilei"] >= 3)
            return "black"; // 3 dilei have been cleaned, junqi could be held
        else return "invalid"; // there still remains dilei
    }
}

module.exports = {
    chessJson,
    chessIDs,
    judgeWinner
}
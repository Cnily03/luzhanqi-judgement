module.exports = {
    /**
     *  Settings of object livePlayInfo
     */
    live: {
        timeOut: { // second
            emptyConn: 10 * 60,
            hasConn: 30 * 60
        },
        detectTimeOutInterval: 60 * 1000 // ms
    },
    /**
     * Settings of WebSoket
     */
    WebSocket: {
        server_port: 7021,
        client_host: "" // default: ctx.hostname + ":" + server_port
    }
}
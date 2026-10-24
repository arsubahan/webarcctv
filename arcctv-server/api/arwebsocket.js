const WebSocket = require('ws');

let wss = null;

function createWebSocketServer(port) {

    console.log("\n\nport = " +  port  + '\n\n')

    if (wss) {
        console.log("WebSocket server already exists");
        return wss;
    }

    wss = new WebSocket.Server({
        port: port
    });

    wss.on('connection', (ws) => {
        console.log("New WebSocket client connected");

        ws.on('close', () => {
            console.log("WebSocket client disconnected");
        });
    });

    console.log("arwsbsocket   -  WebSocket server started on port", port);

    return wss;
}

function getWebSocketServer() {
    return wss;
}

const wsServers = {};


function createCameraSocket(camId, port) {

    if (wsServers[camId]) {
        return wsServers[camId];
    }


    const wss = new WebSocket.Server({
        port: port,
        path: `/ws/${camId}`
    });


    wsServers[camId] = wss;


    wss.on('connection', ws => {
        console.log(camId, "connected");
    });


    return wss;
}

function getCameraSocket(camId) {
    return wsServers[camId];
}



module.exports = {
    createWebSocketServer,
    getWebSocketServer,
    createCameraSocket,
    getCameraSocket
};
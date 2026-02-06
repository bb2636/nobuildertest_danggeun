"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const app_1 = require("./app");
const socket_1 = require("./socket");
const server = http_1.default.createServer(app_1.app);
const PORT = env_1.config.server.port;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // 모바일 WebView 등 모든 origin 허용
        credentials: false,
    },
    path: '/socket.io',
});
(0, socket_1.setupSocket)(io);
app_1.app.set('io', io);
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[backend] Server running at http://localhost:${PORT} (NODE_ENV=${env_1.config.env})`);
    console.log(`[backend] LAN 접속: http://<본인IP>:${PORT} (예: http://172.30.1.71:${PORT})`);
});
//# sourceMappingURL=index.js.map
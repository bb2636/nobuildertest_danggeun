import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { config } from './config/env';
import { app } from './app';
import { setupSocket } from './socket';

const server = http.createServer(app);
const PORT = config.server.port;

const io = new SocketServer(server, {
  cors: {
    origin: '*', // 모바일 WebView 등 모든 origin 허용
    credentials: false,
  },
  path: '/socket.io',
});
setupSocket(io);
app.set('io', io);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[backend] Server running at http://localhost:${PORT} (NODE_ENV=${config.env})`);
  console.log(`[backend] LAN 접속: http://<본인IP>:${PORT} (예: http://172.30.1.71:${PORT})`);
});

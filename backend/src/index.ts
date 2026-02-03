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
    origin:
      config.isProduction && config.cors.allowedOrigins.length > 0
        ? config.cors.allowedOrigins
        : config.isProduction
          ? false
          : true,
    credentials: true,
  },
  path: '/socket.io',
});
setupSocket(io);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`[backend] Server running at http://localhost:${PORT} (NODE_ENV=${config.env})`);
});

/**
 * Express 앱 생성 (서버 listen 없음).
 * index.ts에서 사용하고, 통합 테스트에서 app만 import하여 사용.
 */
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { ping } from './config/database';
import { requestLogger } from './middleware/requestLogger.middleware';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import favoriteRoutes from './routes/favorite.routes';
import locationRoutes from './routes/location.routes';
import postRoutes from './routes/post.routes';
import communityRoutes from './routes/community.routes';
import uploadRoutes from './routes/upload.routes';
import notificationsRoutes from './routes/notifications.routes';
import searchRoutes from './routes/search.routes';

const app = express();

if (!fs.existsSync(config.upload.dir)) {
  fs.mkdirSync(config.upload.dir, { recursive: true });
}

const corsOptions: cors.CorsOptions = {
  // 모든 기기에서 접속 가능 (모바일 WebView origin: null / capacitor:// 대응)
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  message: { message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/search', searchRoutes);

// /uploads 이미지 요청에 CORS 헤더 명시 (모바일 앱 fetch 이미지 로드용)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.resolve(config.upload.dir)));

app.get('/health', async (_req, res) => {
  const dbOk = await ping();
  if (!dbOk) {
    res.status(503).json({ ok: false, db: 'unhealthy' });
    return;
  }
  res.json({ ok: true, db: 'healthy' });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

export { app };

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
/**
 * Express 앱 생성 (서버 listen 없음).
 * index.ts에서 사용하고, 통합 테스트에서 app만 import하여 사용.
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const requestLogger_middleware_1 = require("./middleware/requestLogger.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const favorite_routes_1 = __importDefault(require("./routes/favorite.routes"));
const location_routes_1 = __importDefault(require("./routes/location.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const community_routes_1 = __importDefault(require("./routes/community.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const app = (0, express_1.default)();
exports.app = app;
if (!fs_1.default.existsSync(env_1.config.upload.dir)) {
    fs_1.default.mkdirSync(env_1.config.upload.dir, { recursive: true });
}
const corsOptions = {
    // 모든 기기에서 접속 가능 (모바일 WebView origin: null / capacitor:// 대응)
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(requestLogger_middleware_1.requestLogger);
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 120,
    message: { message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, auth_routes_1.default);
app.use('/api/favorites', favorite_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/locations', location_routes_1.default);
app.use('/api/posts', post_routes_1.default);
app.use('/api/community', community_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/notifications', notifications_routes_1.default);
app.use('/api/search', search_routes_1.default);
// /uploads 이미지 요청에 CORS 헤더 명시 (모바일 앱 fetch 이미지 로드용)
app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
}, express_1.default.static(path_1.default.resolve(env_1.config.upload.dir)));
app.get('/health', async (_req, res) => {
    const dbOk = await (0, database_1.ping)();
    if (!dbOk) {
        res.status(503).json({ ok: false, db: 'unhealthy' });
        return;
    }
    res.json({ ok: true, db: 'healthy' });
});
app.use((_req, res) => {
    res.status(404).json({ message: 'Not Found' });
});
//# sourceMappingURL=app.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
/**
 * NODE_ENV별 설정
 * development: 로컬 개발 (상세 로그, CORS 넓게)
 * production: 배포 (에러만 로그, CORS 제한)
 */
exports.config = {
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
    server: {
        port: Number(process.env.PORT) || 3001,
    },
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '1234',
        database: process.env.DB_NAME || 'danggeun',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    upload: {
        dir: process.env.UPLOAD_DIR || 'uploads',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        /** 업로드된 파일의 공개 URL 기준 (응답 url에 사용). 비우면 http://localhost:PORT */
        publicBaseUrl: process.env.API_BASE_URL || '',
    },
    cors: {
        /** production에서 허용할 origin (쉼표 구분). 비어 있으면 CORS_ORIGIN 미설정 시 same-origin만 */
        allowedOrigins: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ?? [],
    },
};
//# sourceMappingURL=env.js.map
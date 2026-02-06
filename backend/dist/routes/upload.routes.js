"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, env_1.config.upload.dir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || '.jpg';
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
        cb(null, name);
    },
});
// 서버 측 검증: 크기·MIME 제한 (프론트만 믿지 않고 백엔드에서도 검증)
const MAX_SIZE_MB = env_1.config.upload.maxFileSize / (1024 * 1024);
const ALLOWED_MIMES = /^image\/(jpeg|jpg|png|gif|webp)$/i;
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: env_1.config.upload.maxFileSize },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIMES.test(file.mimetype)) {
            cb(new Error('이미지 파일만 업로드 가능합니다. (jpeg, png, gif, webp)'));
            return;
        }
        cb(null, true);
    },
});
router.post('/', auth_middleware_1.authMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ message: '이미지 파일을 선택해주세요.' });
        return;
    }
    // 모바일 앱에서 이미지 로드되도록 상대 경로 반환 (프론트에서 API_BASE 붙임). 배포 시 publicBaseUrl 설정하면 절대 URL 반환
    const url = env_1.config.upload.publicBaseUrl
        ? `${env_1.config.upload.publicBaseUrl}/uploads/${req.file.filename}`
        : `/uploads/${req.file.filename}`;
    res.status(201).json({ url });
}, (err, _req, res, next) => {
    if (err instanceof multer_1.default.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
            message: `파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.`,
        });
        return;
    }
    if (err) {
        res.status(400).json({ message: err.message || '업로드 실패' });
        return;
    }
    next();
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map
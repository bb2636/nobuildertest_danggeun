"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const errorResponse_1 = require("../utils/errorResponse");
const logger_1 = require("../utils/logger");
exports.authController = {
    async signUp(req, res) {
        const { email, password, nickname, locationName, locationCode } = req.body;
        if (!email || !password || !nickname) {
            res.status(400).json({ message: '이메일, 비밀번호, 닉네임은 필수입니다.' });
            return;
        }
        try {
            const result = await auth_service_1.authService.signUp({
                email,
                password,
                nickname,
                locationName,
                locationCode,
            });
            res.status(201).json(result);
        }
        catch (e) {
            const err = e;
            const code = err.statusCode ?? 500;
            if (code >= 500)
                logger_1.logger.error('auth.signUp', err);
            res.status(code).json({ message: (0, errorResponse_1.getPublicMessage)(err, code) });
        }
    },
    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
            return;
        }
        try {
            const result = await auth_service_1.authService.login(email, password);
            res.json(result);
        }
        catch (e) {
            const err = e;
            const code = err.statusCode ?? 500;
            if (code >= 500)
                logger_1.logger.error('auth.login', err);
            res.status(code).json({ message: (0, errorResponse_1.getPublicMessage)(err, code) });
        }
    },
    async getMe(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        try {
            const user = await auth_service_1.authService.getMe(userId);
            if (!user) {
                res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
                return;
            }
            res.json({ user });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('auth.getMe', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async updateMe(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const { nickname, locationName, locationCode, profileImageUrl } = req.body;
        try {
            const user = await auth_service_1.authService.updateProfile(userId, {
                nickname,
                locationName: locationName ?? undefined,
                locationCode: locationCode ?? undefined,
                profileImageUrl: profileImageUrl ?? undefined,
            });
            if (!user) {
                res.status(400).json({ message: '변경할 내용이 없습니다.' });
                return;
            }
            res.json({ user });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('auth.updateMe', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
};
//# sourceMappingURL=auth.controller.js.map
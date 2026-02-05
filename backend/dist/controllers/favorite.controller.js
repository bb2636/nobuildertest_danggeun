"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteController = void 0;
const favorite_service_1 = require("../services/favorite.service");
const errorResponse_1 = require("../utils/errorResponse");
const logger_1 = require("../utils/logger");
exports.favoriteController = {
    async toggle(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const postId = Number(req.params.postId);
        if (!Number.isInteger(postId) || postId < 1) {
            res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
            return;
        }
        try {
            const result = await favorite_service_1.favoriteService.toggle(userId, postId);
            res.json(result);
        }
        catch (e) {
            const err = e;
            if (err.statusCode === 404) {
                res.status(404).json({ message: err.message });
                return;
            }
            logger_1.logger.error('favorite.toggle', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async check(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const postId = Number(req.params.postId);
        if (!Number.isInteger(postId) || postId < 1) {
            res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
            return;
        }
        try {
            const favorited = await favorite_service_1.favoriteService.check(userId, postId);
            res.json({ favorited });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('favorite.check', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async list(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        try {
            const posts = await favorite_service_1.favoriteService.getFavoritePosts(userId);
            res.json({ posts });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('favorite.list', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
};
//# sourceMappingURL=favorite.controller.js.map
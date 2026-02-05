"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityController = void 0;
const community_service_1 = require("../services/community.service");
const errorResponse_1 = require("../utils/errorResponse");
const logger_1 = require("../utils/logger");
exports.communityController = {
    async getList(req, res) {
        const my = req.query.my === '1' || req.query.my === 'true';
        if (my && !req.userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const locationCode = req.query.locationCode;
        const topic = req.query.topic?.trim() || undefined;
        const sort = req.query.sort === 'popular' ? 'popular' : 'latest';
        const keyword = req.query.keyword?.trim() || undefined;
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        try {
            const result = await community_service_1.communityService.getList({
                locationCode,
                topic,
                sort,
                keyword,
                page,
                limit,
                userId: my ? req.userId : undefined,
            });
            res.json(result);
        }
        catch (e) {
            const err = e;
            const ctx = {};
            if (req.requestId)
                ctx.requestId = req.requestId;
            if (req.userId)
                ctx.userId = req.userId;
            logger_1.logger.error('community.getList', err, ctx);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async getDetail(req, res) {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
            return;
        }
        try {
            const viewer = { userId: req.userId ?? undefined, ip: req.ip };
            const result = await community_service_1.communityService.getDetail(id, viewer);
            if (!result) {
                res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
                return;
            }
            res.json(result);
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('community.getDetail', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async create(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const { title, content, locationName, locationCode } = req.body;
        if (!title || typeof title !== 'string' || !title.trim()) {
            res.status(400).json({ message: '제목은 필수입니다.' });
            return;
        }
        try {
            const result = await community_service_1.communityService.create(userId, {
                title: title.trim(),
                content: content ?? null,
                locationName: locationName ?? null,
                locationCode: locationCode ?? null,
            });
            res.status(201).json(result);
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('community.create', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async update(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
            return;
        }
        const { title, content, topic } = req.body;
        try {
            const result = await community_service_1.communityService.update(userId, id, {
                title: title !== undefined ? String(title).trim() : undefined,
                content: content !== undefined ? content : undefined,
                topic: topic !== undefined ? (topic ? String(topic).trim() : null) : undefined,
            });
            if (!result.ok) {
                res.status(result.message === '게시글을 찾을 수 없습니다.' ? 404 : 403).json({ message: result.message });
                return;
            }
            res.json({ ok: true });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('community.update', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async delete(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
            return;
        }
        try {
            const result = await community_service_1.communityService.delete(userId, id);
            if (!result.ok) {
                res.status(result.message === '게시글을 찾을 수 없습니다.' ? 404 : 403).json({ message: result.message });
                return;
            }
            res.json({ ok: true });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('community.delete', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async getComments(req, res) {
        const postId = Number(req.params.id);
        if (!Number.isInteger(postId) || postId < 1) {
            res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
            return;
        }
        const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100));
        try {
            const messages = await community_service_1.communityService.getComments(postId, limit);
            res.json({ comments: messages });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('community.getComments', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async getMyComments(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        try {
            const result = await community_service_1.communityService.getMyComments(userId, page, limit);
            res.json(result);
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('community.getMyComments', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async markNotificationsRead(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        try {
            await community_service_1.communityService.markCommunityNotificationsRead(userId);
            res.json({ ok: true });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('community.markNotificationsRead', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async createComment(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const postId = Number(req.params.id);
        if (!Number.isInteger(postId) || postId < 1) {
            res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
            return;
        }
        const { content } = req.body;
        try {
            const result = await community_service_1.communityService.createComment(postId, userId, content ?? '');
            const io = req.app.get('io');
            if (io) {
                io.to(`community_post:${postId}`).emit('community_comment_added', result);
            }
            res.status(201).json(result);
        }
        catch (e) {
            const err = e;
            const code = err.statusCode ?? 500;
            if (code >= 500)
                logger_1.logger.error('community.createComment', err);
            res.status(code).json({ message: (0, errorResponse_1.getPublicMessage)(err, code) });
        }
    },
};
//# sourceMappingURL=community.controller.js.map
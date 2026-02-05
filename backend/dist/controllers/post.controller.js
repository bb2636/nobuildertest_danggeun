"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postController = void 0;
const post_service_1 = require("../services/post.service");
const errorResponse_1 = require("../utils/errorResponse");
const logger_1 = require("../utils/logger");
exports.postController = {
    async getList(req, res) {
        const my = req.query.my === '1' || req.query.my === 'true';
        if (my && !req.userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const locationCode = req.query.locationCode;
        const status = req.query.status;
        const keyword = req.query.keyword;
        const category = req.query.category;
        try {
            const result = await post_service_1.postService.getList({
                page,
                limit,
                locationCode,
                status,
                keyword,
                category,
                userId: my ? req.userId : undefined,
            });
            res.json(result);
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('post.getList', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async getDetail(req, res) {
        const id = Number(req.params.id);
        const skipViewIncrement = req.query.skipViewIncrement === '1' || req.query.forEdit === '1';
        if (!Number.isInteger(id) || id < 1) {
            res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
            return;
        }
        try {
            const viewer = { userId: req.userId ?? undefined, ip: req.ip };
            const result = await post_service_1.postService.getDetail(id, skipViewIncrement, viewer);
            if (!result) {
                res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
                return;
            }
            res.json(result);
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('post.getDetail', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async create(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const { title, content, price, status, category, locationName, locationCode, imageUrls } = req.body;
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            res.status(400).json({ message: '제목은 필수입니다.' });
            return;
        }
        try {
            const result = await post_service_1.postService.create(userId, {
                title: title.trim(),
                content: content ?? null,
                price: price != null ? Number(price) : null,
                status,
                category: category ?? null,
                locationName: locationName ?? null,
                locationCode: locationCode ?? null,
                imageUrls: Array.isArray(imageUrls) ? imageUrls : null,
            });
            res.status(201).json(result);
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('post.create', err);
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
        const { title, content, price, status, category, locationName, locationCode, imageUrls } = req.body;
        try {
            const result = await post_service_1.postService.update(userId, id, {
                title: title !== undefined ? String(title).trim() : undefined,
                content: content !== undefined ? content : undefined,
                price: price !== undefined ? (price == null ? null : Number(price)) : undefined,
                status,
                category: category !== undefined ? category : undefined,
                locationName: locationName !== undefined ? locationName : undefined,
                locationCode: locationCode !== undefined ? locationCode : undefined,
                imageUrls: imageUrls !== undefined ? (Array.isArray(imageUrls) ? imageUrls : null) : undefined,
            });
            if (!result.ok) {
                const statusCode = result.message === '게시글을 찾을 수 없습니다.' ? 404 : 403;
                res.status(statusCode).json({ message: result.message });
                return;
            }
            res.json({ ok: true });
        }
        catch (e) {
            const err = e;
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
            const result = await post_service_1.postService.delete(userId, id);
            if (!result.ok) {
                const statusCode = result.message === '게시글을 찾을 수 없습니다.' ? 404 : 403;
                res.status(statusCode).json({ message: result.message });
                return;
            }
            res.json({ ok: true });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('post.delete', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async updateStatus(req, res) {
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
        const { status } = req.body;
        if (!status || typeof status !== 'string') {
            res.status(400).json({ message: 'status는 필수이며 SALE, RESERVED, SOLD 중 하나여야 합니다.' });
            return;
        }
        try {
            const result = await post_service_1.postService.updateStatus(userId, id, status);
            if (!result.ok) {
                const statusCode = result.message === '게시글을 찾을 수 없습니다.' ? 404 :
                    result.message === '유효하지 않은 상태입니다. (SALE, RESERVED, SOLD)' ? 400 : 403;
                res.status(statusCode).json({ message: result.message });
                return;
            }
            res.json({ ok: true, status });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('post.updateStatus', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
};
//# sourceMappingURL=post.controller.js.map
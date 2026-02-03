import { Response } from 'express';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { postService } from '../services/post.service';
import { PostStatus } from '../types';
import { getPublicMessage } from '../utils/errorResponse';
import { logger } from '../utils/logger';

export const postController = {
  async getList(req: AuthRequest, res: Response): Promise<void> {
    const my = req.query.my === '1' || req.query.my === 'true';
    if (my && !req.userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const locationCode = req.query.locationCode as string | undefined;
    const status = req.query.status as PostStatus | undefined;
    const keyword = req.query.keyword as string | undefined;
    const category = req.query.category as string | undefined;
    try {
      const result = await postService.getList({
        page,
        limit,
        locationCode,
        status,
        keyword,
        category,
        userId: my ? req.userId : undefined,
      });
      res.json(result);
    } catch (e) {
      const err = e as Error;
      logger.error('post.getList', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async getDetail(req: AuthRequest, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const skipViewIncrement = req.query.skipViewIncrement === '1' || req.query.forEdit === '1';
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
      return;
    }
    try {
      const result = await postService.getDetail(id, skipViewIncrement);
      if (!result) {
        res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        return;
      }
      res.json(result);
    } catch (e) {
      const err = e as Error;
      logger.error('post.getDetail', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const { title, content, price, status, category, locationName, locationCode, imageUrls } =
      req.body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ message: '제목은 필수입니다.' });
      return;
    }
    try {
      const result = await postService.create(userId, {
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
    } catch (e) {
      const err = e as Error;
      logger.error('post.create', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
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
    const { title, content, price, status, category, locationName, locationCode, imageUrls } =
      req.body;
    try {
      const result = await postService.update(userId, id, {
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
    } catch (e) {
      const err = e as Error;
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
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
      const result = await postService.delete(userId, id);
      if (!result.ok) {
        const statusCode = result.message === '게시글을 찾을 수 없습니다.' ? 404 : 403;
        res.status(statusCode).json({ message: result.message });
        return;
      }
      res.json({ ok: true });
    } catch (e) {
      const err = e as Error;
      logger.error('post.delete', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
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
      const result = await postService.updateStatus(userId, id, status as PostStatus);
      if (!result.ok) {
        const statusCode =
          result.message === '게시글을 찾을 수 없습니다.' ? 404 :
          result.message === '유효하지 않은 상태입니다. (SALE, RESERVED, SOLD)' ? 400 : 403;
        res.status(statusCode).json({ message: result.message });
        return;
      }
      res.json({ ok: true, status });
    } catch (e) {
      const err = e as Error;
      logger.error('post.updateStatus', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },
};

import { Response } from 'express';
import { Server as SocketServer } from 'socket.io';
import { AuthRequest } from '../middleware/auth.middleware';
import type { LogContext } from '../utils/logger';
import { communityService } from '../services/community.service';
import { getPublicMessage } from '../utils/errorResponse';
import { logger } from '../utils/logger';

export const communityController = {
  async getList(req: AuthRequest, res: Response): Promise<void> {
    const my = req.query.my === '1' || req.query.my === 'true';
    if (my && !req.userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const locationCode = req.query.locationCode as string | undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    try {
      const result = await communityService.getList({
        locationCode,
        page,
        limit,
        userId: my ? req.userId : undefined,
      });
      res.json(result);
    } catch (e) {
      const err = e as Error;
      const ctx: LogContext = {};
      if ((req as AuthRequest & { requestId?: string }).requestId) ctx.requestId = (req as AuthRequest & { requestId?: string }).requestId;
      if (req.userId) ctx.userId = req.userId;
      logger.error('community.getList', err, ctx);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async getDetail(req: AuthRequest, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
      return;
    }
    try {
      const result = await communityService.getDetail(id);
      if (!result) {
        res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        return;
      }
      res.json(result);
    } catch (e) {
      const err = e as Error;
      logger.error('community.getDetail', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
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
      const result = await communityService.create(userId, {
        title: title.trim(),
        content: content ?? null,
        locationName: locationName ?? null,
        locationCode: locationCode ?? null,
      });
      res.status(201).json(result);
    } catch (e) {
      const err = e as Error;
      logger.error('community.create', err);
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
    const { title, content } = req.body;
    try {
      const result = await communityService.update(userId, id, {
        title: title !== undefined ? String(title).trim() : undefined,
        content: content !== undefined ? content : undefined,
      });
      if (!result.ok) {
        res.status(result.message === '게시글을 찾을 수 없습니다.' ? 404 : 403).json({ message: result.message });
        return;
      }
      res.json({ ok: true });
    } catch (e) {
      const err = e as Error;
      logger.error('community.update', err);
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
      const result = await communityService.delete(userId, id);
      if (!result.ok) {
        res.status(result.message === '게시글을 찾을 수 없습니다.' ? 404 : 403).json({ message: result.message });
        return;
      }
      res.json({ ok: true });
    } catch (e) {
      const err = e as Error;
      logger.error('community.delete', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async getComments(req: AuthRequest, res: Response): Promise<void> {
    const postId = Number(req.params.id);
    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({ message: '올바른 게시글 ID가 아닙니다.' });
      return;
    }
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100));
    try {
      const messages = await communityService.getComments(postId, limit);
      res.json({ comments: messages });
    } catch (e) {
      const err = e as Error;
      logger.error('community.getComments', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async getMyComments(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    try {
      const result = await communityService.getMyComments(userId, page, limit);
      res.json(result);
    } catch (e) {
      const err = e as Error;
      logger.error('community.getMyComments', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async markNotificationsRead(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    try {
      await communityService.markCommunityNotificationsRead(userId);
      res.json({ ok: true });
    } catch (e) {
      const err = e as Error;
      logger.error('community.markNotificationsRead', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async createComment(req: AuthRequest, res: Response): Promise<void> {
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
      const result = await communityService.createComment(postId, userId, content ?? '');
      const io = req.app.get('io') as SocketServer | undefined;
      if (io) {
        io.to(`community_post:${postId}`).emit('community_comment_added', result);
      }
      res.status(201).json(result);
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      const code = err.statusCode ?? 500;
      if (code >= 500) logger.error('community.createComment', err);
      res.status(code).json({ message: getPublicMessage(err, code) });
    }
  },
};

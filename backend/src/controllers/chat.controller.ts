import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { chatService } from '../services/chat.service';
import { getPublicMessage } from '../utils/errorResponse';
import { logger } from '../utils/logger';

export const chatController = {
  async getOrCreateRoom(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const postId = Number(req.body.postId ?? req.query.postId);
    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({ message: 'postId는 필수이며 1 이상이어야 합니다.' });
      return;
    }
    try {
      const result = await chatService.getOrCreateRoom(userId, postId);
      res.json(result);
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      const code = err.statusCode ?? 500;
      if (code >= 500) logger.error('chat.getOrCreateRoom', err);
      res.status(code).json({ message: getPublicMessage(err, code) });
    }
  },

  async getRoomList(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    try {
      const rooms = await chatService.getRoomList(userId);
      res.json({ rooms });
    } catch (e) {
      const err = e as Error;
      logger.error('chat.getRoomList', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async getRoomDetail(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const roomId = Number(req.params.roomId);
    if (!Number.isInteger(roomId) || roomId < 1) {
      res.status(400).json({ message: '올바른 채팅방 ID가 아닙니다.' });
      return;
    }
    try {
      const room = await chatService.getRoomDetail(roomId, userId);
      if (!room) {
        res.status(404).json({ message: '채팅방을 찾을 수 없거나 접근할 수 없습니다.' });
        return;
      }
      res.json(room);
    } catch (e) {
      const err = e as Error;
      logger.error('chat.getRoomDetail', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async getMessages(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const roomId = Number(req.params.roomId);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const beforeId = req.query.beforeId ? Number(req.query.beforeId) : undefined;
    if (!Number.isInteger(roomId) || roomId < 1) {
      res.status(400).json({ message: '올바른 채팅방 ID가 아닙니다.' });
      return;
    }
    try {
      const messages = await chatService.getMessages(roomId, userId, limit, beforeId);
      res.json({ messages });
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      const code = err.statusCode ?? 500;
      if (code >= 500) logger.error('chat.getMessages', err);
      res.status(code).json({ message: getPublicMessage(err, code) });
    }
  },

  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const roomId = Number(req.params.roomId);
    const { content } = req.body;
    if (!Number.isInteger(roomId) || roomId < 1) {
      res.status(400).json({ message: '올바른 채팅방 ID가 아닙니다.' });
      return;
    }
    try {
      const result = await chatService.sendMessage(roomId, userId, content ?? '');
      res.status(201).json(result);
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      const code = err.statusCode ?? 500;
      if (code >= 500) logger.error('chat.sendMessage', err);
      res.status(code).json({ message: getPublicMessage(err, code) });
    }
  },
};

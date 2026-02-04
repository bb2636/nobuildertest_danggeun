import { Response } from 'express';
import { Server as SocketServer } from 'socket.io';
import { AuthRequest } from '../middleware/auth.middleware';
import { chatService } from '../services/chat.service';
import { chatRepository } from '../repositories/chat.repository';
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

  /** 해당 게시글에 대한 대화중인 채팅방 목록 */
  async getRoomsByPostId(req: AuthRequest, res: Response): Promise<void> {
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
      const rooms = await chatService.getRoomsByPostId(postId, userId);
      res.json({ rooms });
    } catch (e) {
      const err = e as Error;
      logger.error('chat.getRoomsByPostId', err);
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
    const { content, type } = req.body as { content?: string; type?: string };
    if (!Number.isInteger(roomId) || roomId < 1) {
      res.status(400).json({ message: '올바른 채팅방 ID가 아닙니다.' });
      return;
    }
    const messageType = type === 'image' ? 'image' : 'text';
    try {
      const result = await chatService.sendMessage(roomId, userId, content ?? '', messageType);
      const io = req.app.get('io') as SocketServer | undefined;
      if (io) {
        const memberIds = await chatRepository.getMemberUserIds(roomId);
        memberIds.forEach((uid) => io.to(`user:${uid}`).emit('chat_list_updated'));
      }
      res.status(201).json(result);
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      const code = err.statusCode ?? 500;
      if (code >= 500) logger.error('chat.sendMessage', err);
      res.status(code).json({ message: getPublicMessage(err, code) });
    }
  },

  /** 약속잡기 (게시글 주인만) */
  async createAppointment(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    const roomId = Number(req.params.roomId);
    const { date, time, place } = req.body as { date?: string; time?: string; place?: string };
    if (!Number.isInteger(roomId) || roomId < 1) {
      res.status(400).json({ message: '올바른 채팅방 ID가 아닙니다.' });
      return;
    }
    if (!date || !time || !place || typeof place !== 'string' || place.trim() === '') {
      res.status(400).json({ message: '날짜, 시간, 장소를 모두 입력해주세요.' });
      return;
    }
    try {
      const result = await chatService.createAppointment(roomId, userId, { date: String(date).trim(), time: String(time).trim(), place: place.trim() });
      const io = req.app.get('io') as SocketServer | undefined;
      if (io) {
        const memberIds = await chatRepository.getMemberUserIds(roomId);
        memberIds.forEach((uid) => io.to(`user:${uid}`).emit('chat_list_updated'));
        const row = await chatRepository.findMessageById(result.messageId);
        if (row) {
          io.to(`room:${roomId}`).emit('new_message', {
            id: row.id,
            userId: row.userId,
            nickname: row.nickname,
            content: row.content,
            messageType: row.messageType || 'appointment',
            createdAt: new Date(row.createdAt).toISOString(),
          });
        }
      }
      res.status(201).json(result);
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      const code = err.statusCode ?? 500;
      if (code >= 500) logger.error('chat.createAppointment', err);
      res.status(code).json({ message: getPublicMessage(err, code) });
    }
  },

  async markRoomRead(req: AuthRequest, res: Response): Promise<void> {
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
      const isMember = await chatRepository.isMember(roomId, userId);
      if (!isMember) {
        res.status(403).json({ message: '채팅방에 접근할 수 없습니다.' });
        return;
      }
      await chatRepository.markRoomAsRead(roomId, userId);
      const io = req.app.get('io') as SocketServer | undefined;
      if (io) io.to(`user:${userId}`).emit('chat_list_updated');
      res.json({ ok: true });
    } catch (e) {
      const err = e as Error;
      logger.error('chat.markRoomRead', err);
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },

  async leaveRoom(req: AuthRequest, res: Response): Promise<void> {
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
      await chatService.leaveRoom(roomId, userId);
      const io = req.app.get('io') as SocketServer | undefined;
      if (io) io.to(`user:${userId}`).emit('chat_list_updated');
      res.json({ ok: true });
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      const code = err.statusCode ?? 500;
      if (code >= 500) logger.error('chat.leaveRoom', err);
      res.status(code).json({ message: getPublicMessage(err, code) });
    }
  },
};

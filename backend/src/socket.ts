import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { config } from './config/env';
import { chatRepository } from './repositories/chat.repository';
import { JwtPayload } from './types';

const ROOM_PREFIX = 'room:';
const USER_PREFIX = 'user:';
export const COMMUNITY_POST_ROOM_PREFIX = 'community_post:';

interface SocketData {
  userId: number;
}

export function setupSocket(io: Server): void {
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth as { token?: string })?.token ||
      (socket.handshake.query as { token?: string }).token;
    if (!token || typeof token !== 'string') {
      next(new Error('인증이 필요합니다.'));
      return;
    }
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      socket.data.userId = decoded.userId;
      next();
    } catch {
      next(new Error('유효하지 않은 토큰입니다.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket.data as SocketData).userId;
    if (!userId) return;
    socket.join(`${USER_PREFIX}${userId}`);

    socket.on('join_room', async (payload: { roomId: number }) => {
      const roomId = payload?.roomId;
      if (!Number.isInteger(roomId) || roomId < 1) return;
      const isMember = await chatRepository.isMember(roomId, userId);
      if (!isMember) return;
      socket.join(`${ROOM_PREFIX}${roomId}`);
    });

    socket.on('leave_room', (payload: { roomId: number }) => {
      const roomId = payload?.roomId;
      if (Number.isInteger(roomId) && roomId >= 1) {
        socket.leave(`${ROOM_PREFIX}${roomId}`);
      }
    });

    socket.on('join_community_post', (payload: { postId: number }) => {
      const postId = payload?.postId;
      if (Number.isInteger(postId) && postId >= 1) {
        socket.join(`${COMMUNITY_POST_ROOM_PREFIX}${postId}`);
      }
    });

    socket.on('leave_community_post', (payload: { postId: number }) => {
      const postId = payload?.postId;
      if (Number.isInteger(postId) && postId >= 1) {
        socket.leave(`${COMMUNITY_POST_ROOM_PREFIX}${postId}`);
      }
    });

    socket.on('send_message', async (payload: { roomId: number; content: string; type?: string }, callback) => {
      const roomId = payload?.roomId;
      const content = typeof payload?.content === 'string' ? payload.content.trim() : '';
      const messageType = payload?.type === 'image' ? 'image' : 'text';
      if (!Number.isInteger(roomId) || roomId < 1 || !content) {
        callback?.({ ok: false, message: 'roomId와 content가 필요합니다.' });
        return;
      }
      const isMember = await chatRepository.isMember(roomId, userId);
      if (!isMember) {
        callback?.({ ok: false, message: '채팅방에 접근할 수 없습니다.' });
        return;
      }
      try {
        const messageId = await chatRepository.createMessage(roomId, userId, content, messageType);
        const row = await chatRepository.findMessageById(messageId);
        if (!row) {
          callback?.({ ok: false, message: '메시지 저장 후 조회 실패' });
          return;
        }
        const message = {
          id: row.id,
          userId: row.userId,
          nickname: row.nickname,
          content: row.content,
          messageType: (row as { messageType?: string }).messageType || 'text',
          createdAt: new Date(row.createdAt).toISOString(),
        };
        io.to(`${ROOM_PREFIX}${roomId}`).emit('new_message', message);
        const memberIds = await chatRepository.getMemberUserIds(roomId);
        memberIds.forEach((uid) => io.to(`${USER_PREFIX}${uid}`).emit('chat_list_updated'));
        callback?.({ ok: true, messageId: row.id });
      } catch {
        callback?.({ ok: false, message: '메시지 전송에 실패했습니다.' });
      }
    });

    socket.on('disconnect', () => {});
  });
}

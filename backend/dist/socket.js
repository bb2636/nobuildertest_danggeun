"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMUNITY_POST_ROOM_PREFIX = void 0;
exports.setupSocket = setupSocket;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("./config/env");
const chat_repository_1 = require("./repositories/chat.repository");
const ROOM_PREFIX = 'room:';
const USER_PREFIX = 'user:';
exports.COMMUNITY_POST_ROOM_PREFIX = 'community_post:';
function setupSocket(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token ||
            socket.handshake.query.token;
        if (!token || typeof token !== 'string') {
            next(new Error('인증이 필요합니다.'));
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwt.secret);
            socket.data.userId = decoded.userId;
            next();
        }
        catch {
            next(new Error('유효하지 않은 토큰입니다.'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        if (!userId)
            return;
        socket.join(`${USER_PREFIX}${userId}`);
        socket.on('join_room', async (payload) => {
            const roomId = payload?.roomId;
            if (!Number.isInteger(roomId) || roomId < 1)
                return;
            const isMember = await chat_repository_1.chatRepository.isMember(roomId, userId);
            if (!isMember)
                return;
            socket.join(`${ROOM_PREFIX}${roomId}`);
        });
        socket.on('leave_room', (payload) => {
            const roomId = payload?.roomId;
            if (Number.isInteger(roomId) && roomId >= 1) {
                socket.leave(`${ROOM_PREFIX}${roomId}`);
            }
        });
        socket.on('join_community_post', (payload) => {
            const postId = payload?.postId;
            if (Number.isInteger(postId) && postId >= 1) {
                socket.join(`${exports.COMMUNITY_POST_ROOM_PREFIX}${postId}`);
            }
        });
        socket.on('leave_community_post', (payload) => {
            const postId = payload?.postId;
            if (Number.isInteger(postId) && postId >= 1) {
                socket.leave(`${exports.COMMUNITY_POST_ROOM_PREFIX}${postId}`);
            }
        });
        socket.on('send_message', async (payload, callback) => {
            const roomId = payload?.roomId;
            const content = typeof payload?.content === 'string' ? payload.content.trim() : '';
            const messageType = payload?.type === 'image' ? 'image' : 'text';
            if (!Number.isInteger(roomId) || roomId < 1 || !content) {
                callback?.({ ok: false, message: 'roomId와 content가 필요합니다.' });
                return;
            }
            const isMember = await chat_repository_1.chatRepository.isMember(roomId, userId);
            if (!isMember) {
                callback?.({ ok: false, message: '채팅방에 접근할 수 없습니다.' });
                return;
            }
            try {
                const messageId = await chat_repository_1.chatRepository.createMessage(roomId, userId, content, messageType);
                const row = await chat_repository_1.chatRepository.findMessageById(messageId);
                if (!row) {
                    callback?.({ ok: false, message: '메시지 저장 후 조회 실패' });
                    return;
                }
                const message = {
                    id: row.id,
                    userId: row.userId,
                    nickname: row.nickname,
                    content: row.content,
                    messageType: row.messageType || 'text',
                    createdAt: new Date(row.createdAt).toISOString(),
                };
                io.to(`${ROOM_PREFIX}${roomId}`).emit('new_message', message);
                const memberIds = await chat_repository_1.chatRepository.getMemberUserIds(roomId);
                memberIds.forEach((uid) => io.to(`${USER_PREFIX}${uid}`).emit('chat_list_updated'));
                callback?.({ ok: true, messageId: row.id });
            }
            catch {
                callback?.({ ok: false, message: '메시지 전송에 실패했습니다.' });
            }
        });
        socket.on('disconnect', () => { });
    });
}
//# sourceMappingURL=socket.js.map
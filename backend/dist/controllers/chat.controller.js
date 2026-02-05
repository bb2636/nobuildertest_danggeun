"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const chat_service_1 = require("../services/chat.service");
const chat_repository_1 = require("../repositories/chat.repository");
const errorResponse_1 = require("../utils/errorResponse");
const logger_1 = require("../utils/logger");
exports.chatController = {
    async getOrCreateRoom(req, res) {
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
            const result = await chat_service_1.chatService.getOrCreateRoom(userId, postId);
            res.json(result);
        }
        catch (e) {
            const err = e;
            const code = err.statusCode ?? 500;
            if (code >= 500)
                logger_1.logger.error('chat.getOrCreateRoom', err);
            res.status(code).json({ message: (0, errorResponse_1.getPublicMessage)(err, code) });
        }
    },
    async getRoomList(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        try {
            const rooms = await chat_service_1.chatService.getRoomList(userId);
            res.json({ rooms });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('chat.getRoomList', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    /** 해당 게시글에 대한 대화중인 채팅방 목록 */
    async getRoomsByPostId(req, res) {
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
            const rooms = await chat_service_1.chatService.getRoomsByPostId(postId, userId);
            res.json({ rooms });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('chat.getRoomsByPostId', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async getRoomDetail(req, res) {
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
            const room = await chat_service_1.chatService.getRoomDetail(roomId, userId);
            if (!room) {
                res.status(404).json({ message: '채팅방을 찾을 수 없거나 접근할 수 없습니다.' });
                return;
            }
            res.json(room);
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('chat.getRoomDetail', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async getMessages(req, res) {
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
            const messages = await chat_service_1.chatService.getMessages(roomId, userId, limit, beforeId);
            res.json({ messages });
        }
        catch (e) {
            const err = e;
            const code = err.statusCode ?? 500;
            if (code >= 500)
                logger_1.logger.error('chat.getMessages', err);
            res.status(code).json({ message: (0, errorResponse_1.getPublicMessage)(err, code) });
        }
    },
    async sendMessage(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const roomId = Number(req.params.roomId);
        const { content, type } = req.body;
        if (!Number.isInteger(roomId) || roomId < 1) {
            res.status(400).json({ message: '올바른 채팅방 ID가 아닙니다.' });
            return;
        }
        const messageType = type === 'image' ? 'image' : 'text';
        try {
            const result = await chat_service_1.chatService.sendMessage(roomId, userId, content ?? '', messageType);
            const io = req.app.get('io');
            if (io) {
                const memberIds = await chat_repository_1.chatRepository.getMemberUserIds(roomId);
                memberIds.forEach((uid) => io.to(`user:${uid}`).emit('chat_list_updated'));
            }
            res.status(201).json(result);
        }
        catch (e) {
            const err = e;
            const code = err.statusCode ?? 500;
            if (code >= 500)
                logger_1.logger.error('chat.sendMessage', err);
            res.status(code).json({ message: (0, errorResponse_1.getPublicMessage)(err, code) });
        }
    },
    /** 약속잡기 (게시글 주인만) */
    async createAppointment(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const roomId = Number(req.params.roomId);
        const { date, time, place } = req.body;
        if (!Number.isInteger(roomId) || roomId < 1) {
            res.status(400).json({ message: '올바른 채팅방 ID가 아닙니다.' });
            return;
        }
        if (!date || !time || !place || typeof place !== 'string' || place.trim() === '') {
            res.status(400).json({ message: '날짜, 시간, 장소를 모두 입력해주세요.' });
            return;
        }
        try {
            const result = await chat_service_1.chatService.createAppointment(roomId, userId, { date: String(date).trim(), time: String(time).trim(), place: place.trim() });
            const io = req.app.get('io');
            if (io) {
                const memberIds = await chat_repository_1.chatRepository.getMemberUserIds(roomId);
                memberIds.forEach((uid) => io.to(`user:${uid}`).emit('chat_list_updated'));
                const row = await chat_repository_1.chatRepository.findMessageById(result.messageId);
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
        }
        catch (e) {
            const err = e;
            const code = err.statusCode ?? 500;
            if (code >= 500)
                logger_1.logger.error('chat.createAppointment', err);
            res.status(code).json({ message: (0, errorResponse_1.getPublicMessage)(err, code) });
        }
    },
    async markRoomRead(req, res) {
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
            const isMember = await chat_repository_1.chatRepository.isMember(roomId, userId);
            if (!isMember) {
                res.status(403).json({ message: '채팅방에 접근할 수 없습니다.' });
                return;
            }
            await chat_repository_1.chatRepository.markRoomAsRead(roomId, userId);
            const io = req.app.get('io');
            if (io)
                io.to(`user:${userId}`).emit('chat_list_updated');
            res.json({ ok: true });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('chat.markRoomRead', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
    async leaveRoom(req, res) {
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
            await chat_service_1.chatService.leaveRoom(roomId, userId);
            const io = req.app.get('io');
            if (io)
                io.to(`user:${userId}`).emit('chat_list_updated');
            res.json({ ok: true });
        }
        catch (e) {
            const err = e;
            const code = err.statusCode ?? 500;
            if (code >= 500)
                logger_1.logger.error('chat.leaveRoom', err);
            res.status(code).json({ message: (0, errorResponse_1.getPublicMessage)(err, code) });
        }
    },
};
//# sourceMappingURL=chat.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const chat_repository_1 = require("../repositories/chat.repository");
const post_repository_1 = require("../repositories/post.repository");
exports.chatService = {
    async getOrCreateRoom(buyerUserId, postId) {
        const sellerUserId = await post_repository_1.postRepository.findUserIdById(postId);
        if (!sellerUserId) {
            const err = new Error('게시글을 찾을 수 없습니다.');
            err.statusCode = 404;
            throw err;
        }
        if (sellerUserId === buyerUserId) {
            const err = new Error('본인 게시글에는 채팅할 수 없습니다.');
            err.statusCode = 400;
            throw err;
        }
        let roomId = await chat_repository_1.chatRepository.findRoomByPostAndMembers(postId, buyerUserId, sellerUserId);
        if (roomId != null)
            return { roomId };
        roomId = await chat_repository_1.chatRepository.createRoom(postId);
        await chat_repository_1.chatRepository.addMember(roomId, buyerUserId);
        await chat_repository_1.chatRepository.addMember(roomId, sellerUserId);
        return { roomId };
    },
    async getRoomList(userId) {
        const rows = await chat_repository_1.chatRepository.findRoomsByUserId(userId);
        return rows.map((row) => ({
            ...row,
            lastAt: row.lastAt ? new Date(row.lastAt).toISOString() : null,
        }));
    },
    /** 해당 게시글에 대한 채팅방 목록 (대화중인 채팅용) */
    async getRoomsByPostId(postId, userId) {
        const rows = await chat_repository_1.chatRepository.findRoomsByPostId(postId, userId);
        return rows.map((row) => ({
            ...row,
            lastAt: row.lastAt ? new Date(row.lastAt).toISOString() : null,
        }));
    },
    async getRoomDetail(roomId, userId) {
        const isMember = await chat_repository_1.chatRepository.isMember(roomId, userId);
        if (!isMember)
            return null;
        const row = await chat_repository_1.chatRepository.findRoomByIdWithPost(roomId, userId);
        if (!row)
            return null;
        const { postOwnerId, ...rest } = row;
        return { ...rest, isPostAuthor: userId === postOwnerId };
    },
    /** 채팅방 나가기 */
    async leaveRoom(roomId, userId) {
        const isMember = await chat_repository_1.chatRepository.isMember(roomId, userId);
        if (!isMember) {
            const err = new Error('채팅방에 접근할 수 없습니다.');
            err.statusCode = 403;
            throw err;
        }
        await chat_repository_1.chatRepository.removeMember(roomId, userId);
    },
    async getMessages(roomId, userId, limit, beforeId) {
        const isMember = await chat_repository_1.chatRepository.isMember(roomId, userId);
        if (!isMember) {
            const err = new Error('채팅방에 접근할 수 없습니다.');
            err.statusCode = 403;
            throw err;
        }
        return chat_repository_1.chatRepository.findMessages(roomId, limit, beforeId);
    },
    async sendMessage(roomId, userId, content, messageType = 'text') {
        const isMember = await chat_repository_1.chatRepository.isMember(roomId, userId);
        if (!isMember) {
            const err = new Error('채팅방에 접근할 수 없습니다.');
            err.statusCode = 403;
            throw err;
        }
        const contentTrim = content.trim();
        if (!contentTrim) {
            const err = new Error('메시지 내용을 입력해주세요.');
            err.statusCode = 400;
            throw err;
        }
        const messageId = await chat_repository_1.chatRepository.createMessage(roomId, userId, contentTrim, messageType);
        return { messageId };
    },
    /** 약속잡기 (게시글 주인만 가능) */
    async createAppointment(roomId, userId, payload) {
        const isMember = await chat_repository_1.chatRepository.isMember(roomId, userId);
        if (!isMember) {
            const err = new Error('채팅방에 접근할 수 없습니다.');
            err.statusCode = 403;
            throw err;
        }
        const room = await chat_repository_1.chatRepository.findRoomByIdWithPost(roomId, userId);
        if (!room) {
            const err = new Error('채팅방을 찾을 수 없습니다.');
            err.statusCode = 404;
            throw err;
        }
        const postOwnerId = await post_repository_1.postRepository.findUserIdById(room.postId);
        if (Number(postOwnerId) !== Number(userId)) {
            const err = new Error('해당 게시글의 작성자만 약속을 잡을 수 있습니다.');
            err.statusCode = 403;
            throw err;
        }
        const content = JSON.stringify({ date: payload.date, time: payload.time, place: payload.place });
        const messageId = await chat_repository_1.chatRepository.createMessage(roomId, userId, content, 'appointment');
        return { messageId };
    },
};
//# sourceMappingURL=chat.service.js.map
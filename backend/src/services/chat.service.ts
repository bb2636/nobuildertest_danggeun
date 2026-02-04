import { chatRepository } from '../repositories/chat.repository';
import { postRepository } from '../repositories/post.repository';

export const chatService = {
  async getOrCreateRoom(buyerUserId: number, postId: number): Promise<{ roomId: number }> {
    const sellerUserId = await postRepository.findUserIdById(postId);
    if (!sellerUserId) {
      const err = new Error('게시글을 찾을 수 없습니다.');
      (err as Error & { statusCode?: number }).statusCode = 404;
      throw err;
    }
    if (sellerUserId === buyerUserId) {
      const err = new Error('본인 게시글에는 채팅할 수 없습니다.');
      (err as Error & { statusCode?: number }).statusCode = 400;
      throw err;
    }
    let roomId = await chatRepository.findRoomByPostAndMembers(postId, buyerUserId, sellerUserId);
    if (roomId != null) return { roomId };
    roomId = await chatRepository.createRoom(postId);
    await chatRepository.addMember(roomId, buyerUserId);
    await chatRepository.addMember(roomId, sellerUserId);
    return { roomId };
  },

  async getRoomList(userId: number): Promise<{ roomId: number; postId: number; postTitle: string; postImageUrl: string | null; postPrice: number | null; postStatus: string; otherNickname: string; otherUserId: number; lastMessage: string | null; lastAt: string | null; unreadCount: number }[]> {
    const rows = await chatRepository.findRoomsByUserId(userId);
    return rows.map((row) => ({
      ...row,
      lastAt: row.lastAt ? new Date(row.lastAt).toISOString() : null,
    }));
  },

  /** 해당 게시글에 대한 채팅방 목록 (대화중인 채팅용) */
  async getRoomsByPostId(postId: number, userId: number): Promise<{ roomId: number; otherNickname: string; otherUserId: number; lastMessage: string | null; lastAt: string | null }[]> {
    const rows = await chatRepository.findRoomsByPostId(postId, userId);
    return rows.map((row) => ({
      ...row,
      lastAt: row.lastAt ? new Date(row.lastAt).toISOString() : null,
    }));
  },

  async getRoomDetail(roomId: number, userId: number): Promise<{ roomId: number; postId: number; postTitle: string; postImageUrl: string | null; postPrice: number | null; postStatus: string; isPostAuthor: boolean; otherNickname: string; otherUserId: number } | null> {
    const isMember = await chatRepository.isMember(roomId, userId);
    if (!isMember) return null;
    const row = await chatRepository.findRoomByIdWithPost(roomId, userId);
    if (!row) return null;
    const { postOwnerId, ...rest } = row;
    return { ...rest, isPostAuthor: userId === postOwnerId };
  },

  /** 채팅방 나가기 */
  async leaveRoom(roomId: number, userId: number): Promise<void> {
    const isMember = await chatRepository.isMember(roomId, userId);
    if (!isMember) {
      const err = new Error('채팅방에 접근할 수 없습니다.');
      (err as Error & { statusCode?: number }).statusCode = 403;
      throw err;
    }
    await chatRepository.removeMember(roomId, userId);
  },

  async getMessages(roomId: number, userId: number, limit: number, beforeId?: number) {
    const isMember = await chatRepository.isMember(roomId, userId);
    if (!isMember) {
      const err = new Error('채팅방에 접근할 수 없습니다.');
      (err as Error & { statusCode?: number }).statusCode = 403;
      throw err;
    }
    return chatRepository.findMessages(roomId, limit, beforeId);
  },

  async sendMessage(roomId: number, userId: number, content: string, messageType: 'text' | 'image' = 'text'): Promise<{ messageId: number }> {
    const isMember = await chatRepository.isMember(roomId, userId);
    if (!isMember) {
      const err = new Error('채팅방에 접근할 수 없습니다.');
      (err as Error & { statusCode?: number }).statusCode = 403;
      throw err;
    }
    const contentTrim = content.trim();
    if (!contentTrim) {
      const err = new Error('메시지 내용을 입력해주세요.');
      (err as Error & { statusCode?: number }).statusCode = 400;
      throw err;
    }
    const messageId = await chatRepository.createMessage(roomId, userId, contentTrim, messageType);
    return { messageId };
  },

  /** 약속잡기 (게시글 주인만 가능) */
  async createAppointment(roomId: number, userId: number, payload: { date: string; time: string; place: string }): Promise<{ messageId: number }> {
    const isMember = await chatRepository.isMember(roomId, userId);
    if (!isMember) {
      const err = new Error('채팅방에 접근할 수 없습니다.');
      (err as Error & { statusCode?: number }).statusCode = 403;
      throw err;
    }
    const room = await chatRepository.findRoomByIdWithPost(roomId, userId);
    if (!room) {
      const err = new Error('채팅방을 찾을 수 없습니다.');
      (err as Error & { statusCode?: number }).statusCode = 404;
      throw err;
    }
    const postOwnerId = await postRepository.findUserIdById(room.postId);
    if (Number(postOwnerId) !== Number(userId)) {
      const err = new Error('해당 게시글의 작성자만 약속을 잡을 수 있습니다.');
      (err as Error & { statusCode?: number }).statusCode = 403;
      throw err;
    }
    const content = JSON.stringify({ date: payload.date, time: payload.time, place: payload.place });
    const messageId = await chatRepository.createMessage(roomId, userId, content, 'appointment');
    return { messageId };
  },
};

export declare const chatRepository: {
    findRoomByPostAndMembers(postId: number, userId1: number, userId2: number): Promise<number | null>;
    createRoom(postId: number): Promise<number>;
    addMember(roomId: number, userId: number): Promise<void>;
    isMember(roomId: number, userId: number): Promise<boolean>;
    getMemberUserIds(roomId: number): Promise<number[]>;
    /** 상대가 보낸 메시지가 마지막이고, 아직 읽지 않은 방 개수 (알림용) */
    countRoomsWithLastMessageFromOther(userId: number): Promise<number>;
    /** 해당 방의 메시지 읽음 처리 (마지막 메시지 ID로 갱신) */
    markRoomAsRead(roomId: number, userId: number): Promise<void>;
    findRoomsByUserId(userId: number): Promise<{
        roomId: number;
        postId: number;
        postTitle: string;
        postImageUrl: string | null;
        postPrice: number | null;
        postStatus: string;
        otherNickname: string;
        otherUserId: number;
        lastMessage: string | null;
        lastAt: Date | null;
        unreadCount: number;
    }[]>;
    findRoomByIdWithPost(roomId: number, userId: number): Promise<{
        roomId: number;
        postId: number;
        postTitle: string;
        postImageUrl: string | null;
        postPrice: number | null;
        postStatus: string;
        postOwnerId: number;
        otherNickname: string;
        otherUserId: number;
    } | null>;
    /** 채팅방 나가기: 멤버에서 제거 */
    removeMember(roomId: number, userId: number): Promise<void>;
    /** 해당 게시글에 대한 채팅방 목록 (판매자는 모든 방, 구매자는 본인 참여 방만) */
    findRoomsByPostId(postId: number, userId: number): Promise<{
        roomId: number;
        otherNickname: string;
        otherUserId: number;
        lastMessage: string | null;
        lastAt: Date | null;
    }[]>;
    findMessages(roomId: number, limit: number, beforeId?: number): Promise<{
        id: number;
        userId: number;
        nickname: string;
        content: string;
        messageType: string;
        createdAt: Date;
    }[]>;
    _chatMessagesHasTypeColumn(): Promise<boolean>;
    createMessage(roomId: number, userId: number, content: string, messageType?: string): Promise<number>;
    findMessageById(messageId: number): Promise<{
        id: number;
        userId: number;
        nickname: string;
        content: string;
        messageType: string;
        createdAt: Date;
    } | null>;
};
//# sourceMappingURL=chat.repository.d.ts.map
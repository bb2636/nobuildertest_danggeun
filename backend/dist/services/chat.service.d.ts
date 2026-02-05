export declare const chatService: {
    getOrCreateRoom(buyerUserId: number, postId: number): Promise<{
        roomId: number;
    }>;
    getRoomList(userId: number): Promise<{
        roomId: number;
        postId: number;
        postTitle: string;
        postImageUrl: string | null;
        postPrice: number | null;
        postStatus: string;
        otherNickname: string;
        otherUserId: number;
        lastMessage: string | null;
        lastAt: string | null;
        unreadCount: number;
    }[]>;
    /** 해당 게시글에 대한 채팅방 목록 (대화중인 채팅용) */
    getRoomsByPostId(postId: number, userId: number): Promise<{
        roomId: number;
        otherNickname: string;
        otherUserId: number;
        lastMessage: string | null;
        lastAt: string | null;
    }[]>;
    getRoomDetail(roomId: number, userId: number): Promise<{
        roomId: number;
        postId: number;
        postTitle: string;
        postImageUrl: string | null;
        postPrice: number | null;
        postStatus: string;
        isPostAuthor: boolean;
        otherNickname: string;
        otherUserId: number;
    } | null>;
    /** 채팅방 나가기 */
    leaveRoom(roomId: number, userId: number): Promise<void>;
    getMessages(roomId: number, userId: number, limit: number, beforeId?: number): Promise<{
        id: number;
        userId: number;
        nickname: string;
        content: string;
        messageType: string;
        createdAt: Date;
    }[]>;
    sendMessage(roomId: number, userId: number, content: string, messageType?: "text" | "image"): Promise<{
        messageId: number;
    }>;
    /** 약속잡기 (게시글 주인만 가능) */
    createAppointment(roomId: number, userId: number, payload: {
        date: string;
        time: string;
        place: string;
    }): Promise<{
        messageId: number;
    }>;
};
//# sourceMappingURL=chat.service.d.ts.map
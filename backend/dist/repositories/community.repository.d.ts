interface CommunityPostRow {
    id: number;
    user_id: number;
    title: string;
    content: string | null;
    topic: string | null;
    location_name: string | null;
    location_code: string | null;
    view_count: number;
    created_at: Date;
    updated_at: Date;
    user_nickname: string;
    comment_count: number;
}
export declare const communityRepository: {
    findList(params: {
        locationCode?: string;
        topic?: string;
        sort?: "latest" | "popular";
        page?: number;
        limit?: number;
        userId?: number;
        keyword?: string;
    }): Promise<{
        rows: CommunityPostRow[];
        total: number;
    }>;
    findById(id: number): Promise<(CommunityPostRow & {
        updated_at: Date;
    }) | null>;
    incrementViewCount(id: number): Promise<void>;
    create(data: {
        user_id: number;
        title: string;
        content: string | null;
        topic: string | null;
        location_name: string | null;
        location_code: string | null;
    }): Promise<number>;
    update(id: number, data: {
        title?: string;
        content?: string | null;
        topic?: string | null;
    }): Promise<boolean>;
    delete(id: number): Promise<boolean>;
    findUserIdByPostId(postId: number): Promise<number | null>;
    findCommentsByPostId(postId: number, limit: number): Promise<{
        id: number;
        user_id: number;
        nickname: string;
        content: string;
        created_at: Date;
    }[]>;
    createComment(postId: number, userId: number, content: string): Promise<number>;
    findCommentsByUserId(userId: number, limit: number, offset: number): Promise<{
        id: number;
        post_id: number;
        post_title: string;
        content: string;
        created_at: Date;
    }[]>;
    countCommentsByUserId(userId: number): Promise<number>;
    /** 내 게시글에 다른 사람이 달린 댓글 수 (알림용). 읽음 처리한 시각 이후만 카운트 */
    countCommentsOnMyPostsByOthers(userId: number): Promise<number>;
    /** 동네생활 알림 확인 처리 (이후 댓글은 읽은 것으로 간주) */
    markCommunityNotificationsRead(userId: number): Promise<void>;
    findCommentById(commentId: number): Promise<{
        id: number;
        user_id: number;
        nickname: string;
        content: string;
        created_at: Date;
    } | null>;
};
export {};
//# sourceMappingURL=community.repository.d.ts.map
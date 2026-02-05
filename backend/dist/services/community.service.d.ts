export declare const communityService: {
    getList(params: {
        locationCode?: string;
        topic?: string;
        sort?: "latest" | "popular";
        page?: number;
        limit?: number;
        userId?: number;
        keyword?: string;
    }): Promise<{
        posts: {
            id: number;
            userId: number;
            userNickname: string;
            title: string;
            content: string | null;
            topic: string | null;
            locationName: string | null;
            locationCode: string | null;
            viewCount: number;
            createdAt: string;
            updatedAt: string;
            commentCount: number;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDetail(id: number, viewer?: {
        userId?: number;
        ip?: string;
    }): Promise<{
        id: number;
        userId: number;
        userNickname: string;
        title: string;
        content: string | null;
        topic: string | null;
        locationName: string | null;
        locationCode: string | null;
        viewCount: number;
        createdAt: string;
        updatedAt: string;
        commentCount: number;
    } | null>;
    create(userId: number, body: {
        title: string;
        content?: string | null;
        topic?: string | null;
        locationName?: string | null;
        locationCode?: string | null;
    }): Promise<{
        id: number;
    }>;
    update(userId: number, postId: number, body: {
        title?: string;
        content?: string | null;
        topic?: string | null;
    }): Promise<{
        ok: boolean;
        message: string;
    } | {
        ok: boolean;
        message?: undefined;
    }>;
    delete(userId: number, postId: number): Promise<{
        ok: boolean;
        message: string;
    } | {
        ok: boolean;
        message?: undefined;
    }>;
    getComments(postId: number, limit?: number): Promise<{
        id: number;
        userId: number;
        nickname: string;
        content: string;
        createdAt: string;
    }[]>;
    getMyComments(userId: number, page: number, limit: number): Promise<{
        comments: {
            id: number;
            postId: number;
            postTitle: string;
            content: string;
            createdAt: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    markCommunityNotificationsRead(userId: number): Promise<void>;
    createComment(postId: number, userId: number, content: string): Promise<{
        id: number;
        userId: number;
        nickname: string;
        content: string;
        createdAt: string;
    }>;
};
//# sourceMappingURL=community.service.d.ts.map
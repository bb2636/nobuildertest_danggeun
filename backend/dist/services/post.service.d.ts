import { CreatePostRequestDto, PostDetailDto, PostListQueryDto, PostListResponseDto, UpdatePostRequestDto } from '../dto/post.dto';
import { PostStatus } from '../types';
export declare const postService: {
    getList(params: PostListQueryDto): Promise<PostListResponseDto>;
    getDetail(id: number, skipViewIncrement?: boolean, viewer?: {
        userId?: number;
        ip?: string;
    }): Promise<PostDetailDto | null>;
    create(userId: number, body: CreatePostRequestDto): Promise<{
        id: number;
    }>;
    update(userId: number, postId: number, body: UpdatePostRequestDto): Promise<{
        ok: boolean;
        message?: string;
    }>;
    delete(userId: number, postId: number): Promise<{
        ok: boolean;
        message?: string;
    }>;
    updateStatus(userId: number, postId: number, status: PostStatus): Promise<{
        ok: boolean;
        message?: string;
    }>;
};
//# sourceMappingURL=post.service.d.ts.map
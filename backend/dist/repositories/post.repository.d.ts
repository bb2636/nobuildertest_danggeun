import { PostListQueryDto } from '../dto/post.dto';
import { PostStatus } from '../types';
interface PostListRow {
    id: number;
    title: string;
    price: number | null;
    status: PostStatus;
    category: string | null;
    location_name: string | null;
    image_urls: string | null;
    created_at: Date;
    view_count: number;
    user_nickname: string;
    chat_count: number;
    favorite_count: number;
}
export declare const postRepository: {
    findList(params: PostListQueryDto): Promise<{
        rows: PostListRow[];
        total: number;
    }>;
    findListByIds(postIds: number[]): Promise<PostListRow[]>;
    findById(id: number): Promise<PostDetailRow | null>;
    incrementViewCount(id: number): Promise<void>;
    create(data: {
        user_id: number;
        title: string;
        content: string | null;
        price: number | null;
        status: PostStatus;
        category: string | null;
        location_name: string | null;
        location_code: string | null;
        image_urls: string | null;
    }): Promise<number>;
    findUserIdById(id: number): Promise<number | null>;
    update(id: number, data: {
        title?: string;
        content?: string | null;
        price?: number | null;
        status?: PostStatus;
        category?: string | null;
        location_name?: string | null;
        location_code?: string | null;
        image_urls?: string | null;
    }): Promise<boolean>;
    delete(id: number): Promise<boolean>;
};
interface PostDetailRow {
    id: number;
    user_id: number;
    title: string;
    content: string | null;
    price: number | null;
    status: PostStatus;
    category: string | null;
    location_name: string | null;
    location_code: string | null;
    image_urls: string | null;
    view_count: number;
    created_at: Date;
    updated_at: Date;
    user_nickname: string;
}
export {};
//# sourceMappingURL=post.repository.d.ts.map
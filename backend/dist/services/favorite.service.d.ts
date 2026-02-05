import { PostListItemDto } from '../dto/post.dto';
export declare const favoriteService: {
    toggle(userId: number, postId: number): Promise<{
        favorited: boolean;
    }>;
    check(userId: number, postId: number): Promise<boolean>;
    getPostIds(userId: number): Promise<number[]>;
    getFavoritePosts(userId: number): Promise<PostListItemDto[]>;
};
//# sourceMappingURL=favorite.service.d.ts.map
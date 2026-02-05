export declare const favoriteRepository: {
    add(userId: number, postId: number): Promise<boolean>;
    remove(userId: number, postId: number): Promise<boolean>;
    exists(userId: number, postId: number): Promise<boolean>;
    findPostIdsByUserId(userId: number): Promise<number[]>;
};
//# sourceMappingURL=favorite.repository.d.ts.map
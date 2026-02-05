"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteService = void 0;
const favorite_repository_1 = require("../repositories/favorite.repository");
const post_repository_1 = require("../repositories/post.repository");
function parseImageUrls(json) {
    if (!json)
        return null;
    try {
        const arr = JSON.parse(json);
        return Array.isArray(arr) && arr.length > 0 ? arr : null;
    }
    catch {
        return null;
    }
}
exports.favoriteService = {
    async toggle(userId, postId) {
        const exists = await favorite_repository_1.favoriteRepository.exists(userId, postId);
        if (exists) {
            await favorite_repository_1.favoriteRepository.remove(userId, postId);
            return { favorited: false };
        }
        const postExists = await post_repository_1.postRepository.findUserIdById(postId);
        if (!postExists) {
            const err = new Error('게시글을 찾을 수 없습니다.');
            err.statusCode = 404;
            throw err;
        }
        const added = await favorite_repository_1.favoriteRepository.add(userId, postId);
        return { favorited: added };
    },
    async check(userId, postId) {
        return favorite_repository_1.favoriteRepository.exists(userId, postId);
    },
    async getPostIds(userId) {
        return favorite_repository_1.favoriteRepository.findPostIdsByUserId(userId);
    },
    async getFavoritePosts(userId) {
        const postIds = await favorite_repository_1.favoriteRepository.findPostIdsByUserId(userId);
        if (postIds.length === 0)
            return [];
        const rows = await post_repository_1.postRepository.findListByIds(postIds);
        return rows.map((row) => {
            const urls = parseImageUrls(row.image_urls);
            return {
                id: row.id,
                title: row.title,
                price: row.price,
                status: row.status,
                category: row.category ?? null,
                locationName: row.location_name,
                imageUrl: urls && urls[0] ? urls[0] : null,
                createdAt: new Date(row.created_at).toISOString(),
                viewCount: row.view_count,
                userNickname: row.user_nickname,
                chatCount: Number(row.chat_count) || 0,
                favoriteCount: Number(row.favorite_count) || 0,
            };
        });
    },
};
//# sourceMappingURL=favorite.service.js.map
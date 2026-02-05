import { PostListItemDto } from '../dto/post.dto';
import { favoriteRepository } from '../repositories/favorite.repository';
import { postRepository } from '../repositories/post.repository';
import { PostStatus } from '../types';

function parseImageUrls(json: string | null): string[] | null {
  if (!json) return null;
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) && arr.length > 0 ? arr : null;
  } catch {
    return null;
  }
}

export const favoriteService = {
  async toggle(userId: number, postId: number): Promise<{ favorited: boolean }> {
    const exists = await favoriteRepository.exists(userId, postId);
    if (exists) {
      await favoriteRepository.remove(userId, postId);
      return { favorited: false };
    }
    const postExists = await postRepository.findUserIdById(postId);
    if (!postExists) {
      const err = new Error('게시글을 찾을 수 없습니다.');
      (err as Error & { statusCode?: number }).statusCode = 404;
      throw err;
    }
    const added = await favoriteRepository.add(userId, postId);
    return { favorited: added };
  },

  async check(userId: number, postId: number): Promise<boolean> {
    return favoriteRepository.exists(userId, postId);
  },

  async getPostIds(userId: number): Promise<number[]> {
    return favoriteRepository.findPostIdsByUserId(userId);
  },

  async getFavoritePosts(userId: number): Promise<PostListItemDto[]> {
    const postIds = await favoriteRepository.findPostIdsByUserId(userId);
    if (postIds.length === 0) return [];
    const rows = await postRepository.findListByIds(postIds);
    return rows.map((row) => {
      const urls = parseImageUrls(row.image_urls);
      return {
        id: row.id,
        title: row.title,
        price: row.price,
        status: row.status as PostStatus,
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

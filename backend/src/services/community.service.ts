import { communityRepository } from '../repositories/community.repository';

/** 조회수 중복 카운트 방지: 같은 방문자(유저/IP)가 N초 내 재요청 시 1회만 카운트 */
const VIEW_DEDUP_MS = 60 * 1000; // 1분
const viewCountDedup = new Map<string, number>();

function pruneViewDedup(): void {
  const now = Date.now();
  for (const [key, ts] of viewCountDedup.entries()) {
    if (now - ts > VIEW_DEDUP_MS) viewCountDedup.delete(key);
  }
}

export const communityService = {
  async getList(params: { locationCode?: string; topic?: string; sort?: 'latest' | 'popular'; page?: number; limit?: number; userId?: number; keyword?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 20));
    const { rows, total } = await communityRepository.findList({
      locationCode: params.locationCode,
      topic: params.topic,
      sort: params.sort,
      page,
      limit,
      userId: params.userId,
      keyword: params.keyword,
    });
    const posts = (Array.isArray(rows) ? rows : []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      userNickname: row.user_nickname,
      title: row.title,
      content: row.content,
      topic: row.topic,
      locationName: row.location_name,
      locationCode: row.location_code,
      viewCount: Number(row.view_count ?? 0),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      commentCount: Number(row.comment_count ?? 0),
    }));
    const totalPages = Math.ceil(total / limit) || 1;
    return { posts, total, page, limit, totalPages };
  },

  async getDetail(id: number, viewer?: { userId?: number; ip?: string }) {
    const viewerKey = viewer?.userId ?? viewer?.ip ?? 'unknown';
    const dedupKey = `${id}:${viewerKey}`;
    const now = Date.now();
    const last = viewCountDedup.get(dedupKey);
    if (last == null || now - last >= VIEW_DEDUP_MS) {
      await communityRepository.incrementViewCount(id);
      viewCountDedup.set(dedupKey, now);
      if (viewCountDedup.size > 10000) pruneViewDedup();
    }
    const row = await communityRepository.findById(id);
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      userNickname: row.user_nickname,
      title: row.title,
      content: row.content,
      topic: row.topic,
      locationName: row.location_name,
      locationCode: row.location_code,
      viewCount: Number(row.view_count ?? 0),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      commentCount: Number(row.comment_count ?? 0),
    };
  },

  async create(
    userId: number,
    body: { title: string; content?: string | null; topic?: string | null; locationName?: string | null; locationCode?: string | null }
  ) {
    const id = await communityRepository.create({
      user_id: userId,
      title: body.title.trim(),
      content: body.content?.trim() || null,
      topic: body.topic?.trim() || null,
      location_name: body.locationName ?? null,
      location_code: body.locationCode ?? null,
    });
    return { id };
  },

  async update(userId: number, postId: number, body: { title?: string; content?: string | null; topic?: string | null }) {
    const ownerId = await communityRepository.findUserIdByPostId(postId);
    if (ownerId === null) return { ok: false, message: '게시글을 찾을 수 없습니다.' };
    if (ownerId !== userId) return { ok: false, message: '본인 게시글만 수정할 수 있습니다.' };
    const updated = await communityRepository.update(postId, {
      title: body.title?.trim(),
      content: body.content !== undefined ? (body.content?.trim() || null) : undefined,
      topic: body.topic !== undefined ? (body.topic?.trim() || null) : undefined,
    });
    return { ok: updated };
  },

  async delete(userId: number, postId: number) {
    const ownerId = await communityRepository.findUserIdByPostId(postId);
    if (ownerId === null) return { ok: false, message: '게시글을 찾을 수 없습니다.' };
    if (ownerId !== userId) return { ok: false, message: '본인 게시글만 삭제할 수 있습니다.' };
    const deleted = await communityRepository.delete(postId);
    return { ok: deleted };
  },

  async getComments(postId: number, limit = 100) {
    const rows = await communityRepository.findCommentsByPostId(postId, limit);
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      nickname: row.nickname,
      content: row.content,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  },

  async getMyComments(userId: number, page: number, limit: number) {
    const limitNum = Math.min(50, Math.max(1, limit || 20));
    const offset = (Math.max(1, page) - 1) * limitNum;
    const rows = await communityRepository.findCommentsByUserId(userId, limitNum, offset);
    const total = await communityRepository.countCommentsByUserId(userId);
    const totalPages = Math.ceil(total / limitNum) || 1;
    const comments = rows.map((row) => ({
      id: row.id,
      postId: row.post_id,
      postTitle: row.post_title,
      content: row.content,
      createdAt: new Date(row.created_at).toISOString(),
    }));
    return { comments, total, page: Math.max(1, page), limit: limitNum, totalPages };
  },

  async markCommunityNotificationsRead(userId: number): Promise<void> {
    await communityRepository.markCommunityNotificationsRead(userId);
  },

  async createComment(postId: number, userId: number, content: string) {
    const post = await communityRepository.findById(postId);
    if (!post) {
      const err = new Error('게시글을 찾을 수 없습니다.');
      (err as Error & { statusCode?: number }).statusCode = 404;
      throw err;
    }
    const trimmed = content.trim();
    if (!trimmed) {
      const err = new Error('댓글 내용을 입력해주세요.');
      (err as Error & { statusCode?: number }).statusCode = 400;
      throw err;
    }
    const id = await communityRepository.createComment(postId, userId, trimmed);
    const row = await communityRepository.findCommentById(id);
    if (!row) return { id, userId, nickname: '', content: trimmed, createdAt: new Date().toISOString() };
    return {
      id: row.id,
      userId: row.user_id,
      nickname: row.nickname,
      content: row.content,
      createdAt: new Date(row.created_at).toISOString(),
    };
  },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityService = void 0;
const community_repository_1 = require("../repositories/community.repository");
/** 조회수 중복 카운트 방지: 같은 방문자(유저/IP)가 N초 내 재요청 시 1회만 카운트 */
const VIEW_DEDUP_MS = 60 * 1000; // 1분
const viewCountDedup = new Map();
function pruneViewDedup() {
    const now = Date.now();
    for (const [key, ts] of viewCountDedup.entries()) {
        if (now - ts > VIEW_DEDUP_MS)
            viewCountDedup.delete(key);
    }
}
exports.communityService = {
    async getList(params) {
        const page = Math.max(1, params.page ?? 1);
        const limit = Math.min(50, Math.max(1, params.limit ?? 20));
        const { rows, total } = await community_repository_1.communityRepository.findList({
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
    async getDetail(id, viewer) {
        const viewerKey = viewer?.userId ?? viewer?.ip ?? 'unknown';
        const dedupKey = `${id}:${viewerKey}`;
        const now = Date.now();
        const last = viewCountDedup.get(dedupKey);
        if (last == null || now - last >= VIEW_DEDUP_MS) {
            await community_repository_1.communityRepository.incrementViewCount(id);
            viewCountDedup.set(dedupKey, now);
            if (viewCountDedup.size > 10000)
                pruneViewDedup();
        }
        const row = await community_repository_1.communityRepository.findById(id);
        if (!row)
            return null;
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
    async create(userId, body) {
        const id = await community_repository_1.communityRepository.create({
            user_id: userId,
            title: body.title.trim(),
            content: body.content?.trim() || null,
            topic: body.topic?.trim() || null,
            location_name: body.locationName ?? null,
            location_code: body.locationCode ?? null,
        });
        return { id };
    },
    async update(userId, postId, body) {
        const ownerId = await community_repository_1.communityRepository.findUserIdByPostId(postId);
        if (ownerId === null)
            return { ok: false, message: '게시글을 찾을 수 없습니다.' };
        if (ownerId !== userId)
            return { ok: false, message: '본인 게시글만 수정할 수 있습니다.' };
        const updated = await community_repository_1.communityRepository.update(postId, {
            title: body.title?.trim(),
            content: body.content !== undefined ? (body.content?.trim() || null) : undefined,
            topic: body.topic !== undefined ? (body.topic?.trim() || null) : undefined,
        });
        return { ok: updated };
    },
    async delete(userId, postId) {
        const ownerId = await community_repository_1.communityRepository.findUserIdByPostId(postId);
        if (ownerId === null)
            return { ok: false, message: '게시글을 찾을 수 없습니다.' };
        if (ownerId !== userId)
            return { ok: false, message: '본인 게시글만 삭제할 수 있습니다.' };
        const deleted = await community_repository_1.communityRepository.delete(postId);
        return { ok: deleted };
    },
    async getComments(postId, limit = 100) {
        const rows = await community_repository_1.communityRepository.findCommentsByPostId(postId, limit);
        return rows.map((row) => ({
            id: row.id,
            userId: row.user_id,
            nickname: row.nickname,
            content: row.content,
            createdAt: new Date(row.created_at).toISOString(),
        }));
    },
    async getMyComments(userId, page, limit) {
        const limitNum = Math.min(50, Math.max(1, limit || 20));
        const offset = (Math.max(1, page) - 1) * limitNum;
        const rows = await community_repository_1.communityRepository.findCommentsByUserId(userId, limitNum, offset);
        const total = await community_repository_1.communityRepository.countCommentsByUserId(userId);
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
    async markCommunityNotificationsRead(userId) {
        await community_repository_1.communityRepository.markCommunityNotificationsRead(userId);
    },
    async createComment(postId, userId, content) {
        const post = await community_repository_1.communityRepository.findById(postId);
        if (!post) {
            const err = new Error('게시글을 찾을 수 없습니다.');
            err.statusCode = 404;
            throw err;
        }
        const trimmed = content.trim();
        if (!trimmed) {
            const err = new Error('댓글 내용을 입력해주세요.');
            err.statusCode = 400;
            throw err;
        }
        const id = await community_repository_1.communityRepository.createComment(postId, userId, trimmed);
        const row = await community_repository_1.communityRepository.findCommentById(id);
        if (!row)
            return { id, userId, nickname: '', content: trimmed, createdAt: new Date().toISOString() };
        return {
            id: row.id,
            userId: row.user_id,
            nickname: row.nickname,
            content: row.content,
            createdAt: new Date(row.created_at).toISOString(),
        };
    },
};
//# sourceMappingURL=community.service.js.map
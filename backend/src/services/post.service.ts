import {
  CreatePostRequestDto,
  PostDetailDto,
  PostListItemDto,
  PostListQueryDto,
  PostListResponseDto,
  UpdatePostRequestDto,
} from '../dto/post.dto';
import { postRepository } from '../repositories/post.repository';
import { PostStatus } from '../types';

/** 조회수 중복 카운트 방지: 같은 방문자가 N초 내 재요청 시 1회만 카운트 (동네생활과 동일) */
const VIEW_DEDUP_MS = 60 * 1000;
const postViewDedup = new Map<string, number>();

function prunePostViewDedup(): void {
  const now = Date.now();
  for (const [key, ts] of postViewDedup.entries()) {
    if (now - ts > VIEW_DEDUP_MS) postViewDedup.delete(key);
  }
}

/** MySQL2는 JSON 컬럼을 이미 파싱된 객체/배열로 반환하므로 둘 다 처리 */
function parseImageUrls(json: string | unknown[] | null | undefined): string[] | null {
  if (json == null) return null;
  if (Array.isArray(json)) {
    const urls = json.filter((x): x is string => typeof x === 'string');
    return urls.length > 0 ? urls : null;
  }
  if (typeof json !== 'string') return null;
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) && arr.length > 0 ? arr.filter((x): x is string => typeof x === 'string') : null;
  } catch {
    return null;
  }
}

export const postService = {
  async getList(params: PostListQueryDto): Promise<PostListResponseDto> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 20));
    const { rows, total } = await postRepository.findList({
      ...params,
      page,
      limit,
      userId: params.userId,
    });
    const posts: PostListItemDto[] = (Array.isArray(rows) ? rows : []).map((row) => {
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
      };
    });
    const totalPages = Math.ceil(total / limit) || 1;
    return { posts, total, page, limit, totalPages };
  },

  async getDetail(id: number, skipViewIncrement = false, viewer?: { userId?: number; ip?: string }): Promise<PostDetailDto | null> {
    const row = await postRepository.findById(id);
    if (!row) return null;
    let didIncrement = false;
    if (!skipViewIncrement) {
      const viewerKey = viewer?.userId ?? viewer?.ip ?? 'unknown';
      const dedupKey = `post:${id}:${viewerKey}`;
      const now = Date.now();
      const last = postViewDedup.get(dedupKey);
      if (last == null || now - last >= VIEW_DEDUP_MS) {
        await postRepository.incrementViewCount(id);
        postViewDedup.set(dedupKey, now);
        didIncrement = true;
        if (postViewDedup.size > 10000) prunePostViewDedup();
      }
    }
    const urls = parseImageUrls(row.image_urls);
    const viewCount = skipViewIncrement ? row.view_count : row.view_count + (didIncrement ? 1 : 0);
    return {
      id: row.id,
      userId: row.user_id,
      userNickname: row.user_nickname,
      title: row.title,
      content: row.content,
      price: row.price,
      status: row.status,
      category: row.category,
      locationName: row.location_name,
      locationCode: row.location_code,
      imageUrls: urls ?? [],
      viewCount,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  },

  async create(userId: number, body: CreatePostRequestDto): Promise<{ id: number }> {
    const imageUrlsJson =
      body.imageUrls && body.imageUrls.length > 0
        ? JSON.stringify(body.imageUrls)
        : null;
    const id = await postRepository.create({
      user_id: userId,
      title: body.title,
      content: body.content ?? null,
      price: body.price ?? null,
      status: (body.status ?? 'SALE') as PostStatus,
      category: body.category ?? null,
      location_name: body.locationName ?? null,
      location_code: body.locationCode ?? null,
      image_urls: imageUrlsJson,
    });
    return { id };
  },

  async update(
    userId: number,
    postId: number,
    body: UpdatePostRequestDto
  ): Promise<{ ok: boolean; message?: string }> {
    const ownerId = await postRepository.findUserIdById(postId);
    if (ownerId === null) return { ok: false, message: '게시글을 찾을 수 없습니다.' };
    if (ownerId !== userId) return { ok: false, message: '본인 게시글만 수정할 수 있습니다.' };
    if (body.status !== undefined && !['SALE', 'RESERVED', 'SOLD'].includes(body.status)) {
      return { ok: false, message: 'status는 SALE, RESERVED, SOLD 중 하나여야 합니다.' };
    }
    const imageUrlsJson =
      body.imageUrls !== undefined
        ? body.imageUrls && body.imageUrls.length > 0
          ? JSON.stringify(body.imageUrls)
          : null
        : undefined;
    const updated = await postRepository.update(postId, {
      title: body.title,
      content: body.content,
      price: body.price,
      status: body.status,
      category: body.category,
      location_name: body.locationName,
      location_code: body.locationCode,
      image_urls: imageUrlsJson,
    });
    return { ok: updated };
  },

  async delete(userId: number, postId: number): Promise<{ ok: boolean; message?: string }> {
    const ownerId = await postRepository.findUserIdById(postId);
    if (ownerId === null) return { ok: false, message: '게시글을 찾을 수 없습니다.' };
    if (ownerId !== userId) return { ok: false, message: '본인 게시글만 삭제할 수 있습니다.' };
    const deleted = await postRepository.delete(postId);
    return { ok: deleted };
  },

  async updateStatus(
    userId: number,
    postId: number,
    status: PostStatus
  ): Promise<{ ok: boolean; message?: string }> {
    const validStatuses: PostStatus[] = ['SALE', 'RESERVED', 'SOLD'];
    if (!validStatuses.includes(status)) {
      return { ok: false, message: '유효하지 않은 상태입니다. (SALE, RESERVED, SOLD)' };
    }
    const ownerId = await postRepository.findUserIdById(postId);
    if (ownerId === null) return { ok: false, message: '게시글을 찾을 수 없습니다.' };
    if (ownerId !== userId) return { ok: false, message: '본인 게시글만 상태를 변경할 수 있습니다.' };
    const updated = await postRepository.update(postId, { status });
    return { ok: updated };
  },
};

import { api } from './client'

export type PostStatus = 'SALE' | 'RESERVED' | 'SOLD'

export interface PostListItem {
  id: number
  title: string
  price: number | null
  status: PostStatus
  category: string | null
  locationName: string | null
  imageUrl: string | null
  createdAt: string
  viewCount: number
  userNickname: string
  /** 해당 게시글에 생긴 채팅방 개수 */
  chatCount: number
  /** 해당 게시글 찜 개수 */
  favoriteCount: number
}

export interface PostListResponse {
  posts: PostListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PostListParams {
  page?: number
  limit?: number
  locationCode?: string
  status?: PostStatus
  keyword?: string
  category?: string
  my?: boolean
}

export interface PostDetail {
  id: number
  userId: number
  userNickname: string
  title: string
  content: string | null
  price: number | null
  status: PostStatus
  category: string | null
  locationName: string | null
  locationCode: string | null
  imageUrls: string[]
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface CreatePostBody {
  title: string
  content?: string | null
  price?: number | null
  status?: PostStatus
  category?: string | null
  locationName?: string | null
  locationCode?: string | null
  imageUrls?: string[] | null
}

export interface UpdatePostBody extends CreatePostBody {}

export const postsApi = {
  getList: (params?: PostListParams) => {
    const query =
      params && typeof params.my === 'boolean'
        ? { ...params, my: params.my ? '1' : undefined }
        : params
    return api.get<PostListResponse>('/api/posts', { params: query })
  },
  /** 상세 조회. forEdit: true 시 조회수 증가 생략(수정 페이지 진입용) */
  getDetail: (id: number, options?: { forEdit?: boolean }) =>
    api.get<PostDetail>(`/api/posts/${id}`, {
      params: options?.forEdit ? { forEdit: '1' } : undefined,
    }),
  create: (body: CreatePostBody) => api.post<{ id: number }>('/api/posts', body),
  update: (id: number, body: UpdatePostBody) => api.put<{ ok: boolean }>(`/api/posts/${id}`, body),
  updateStatus: (id: number, status: PostStatus) =>
    api.patch<{ ok: boolean; status: string }>(`/api/posts/${id}/status`, { status }),
  delete: (id: number) => api.delete<{ ok: boolean }>(`/api/posts/${id}`),
}

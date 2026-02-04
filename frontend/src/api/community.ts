import { api } from './client'

export interface CommunityPostListItem {
  id: number
  userId: number
  userNickname: string
  title: string
  content: string | null
  locationName: string | null
  locationCode: string | null
  createdAt: string
  updatedAt: string
  commentCount: number
}

export interface CommunityPostDetail extends CommunityPostListItem {}

export interface CommunityComment {
  id: number
  userId: number
  nickname: string
  content: string
  createdAt: string
}

export interface CommunityListResponse {
  posts: CommunityPostListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CommunityListParams {
  page?: number
  limit?: number
  locationCode?: string
  my?: boolean
}

export interface MyCommentItem {
  id: number
  postId: number
  postTitle: string
  content: string
  createdAt: string
}

export interface MyCommentsResponse {
  comments: MyCommentItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const communityApi = {
  getList: (params?: CommunityListParams) => {
    const query =
      params && typeof params.my === 'boolean'
        ? { ...params, my: params.my ? '1' : undefined }
        : params
    return api.get<CommunityListResponse>('/api/community', { params: query })
  },

  /** 내가 쓴 동네생활 글만 */
  getMyPosts: (params?: { page?: number; limit?: number }) =>
    api.get<CommunityListResponse>('/api/community', { params: { ...params, my: '1' } }),

  /** 내가 쓴 댓글 목록 (원글 정보 포함) */
  getMyComments: (params?: { page?: number; limit?: number }) =>
    api.get<MyCommentsResponse>('/api/community/my-comments', { params }),

  /** 동네생활 알림 확인 처리 (배지 제거) */
  markNotificationsRead: () =>
    api.post<{ ok: boolean }>('/api/community/notifications/read'),

  getDetail: (id: number) =>
    api.get<CommunityPostDetail>(`/api/community/${id}`),

  create: (body: { title: string; content?: string | null; locationName?: string | null; locationCode?: string | null }) =>
    api.post<{ id: number }>('/api/community', body),

  update: (id: number, body: { title?: string; content?: string | null }) =>
    api.put<{ ok: boolean }>(`/api/community/${id}`, body),

  delete: (id: number) =>
    api.delete<{ ok: boolean }>(`/api/community/${id}`),

  getComments: (postId: number, params?: { limit?: number }) =>
    api.get<{ comments: CommunityComment[] }>(`/api/community/${postId}/comments`, { params }),

  createComment: (postId: number, content: string) =>
    api.post<CommunityComment>(`/api/community/${postId}/comments`, { content }),
}

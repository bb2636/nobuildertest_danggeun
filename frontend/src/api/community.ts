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
}

export const communityApi = {
  getList: (params?: CommunityListParams) =>
    api.get<CommunityListResponse>('/api/community', { params }),

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

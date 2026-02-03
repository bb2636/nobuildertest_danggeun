import { api } from './client'
import type { PostListItem } from './posts'

export const favoritesApi = {
  list: () => api.get<{ posts: PostListItem[] }>('/api/favorites'),
  check: (postId: number) =>
    api.get<{ favorited: boolean }>(`/api/favorites/check/${postId}`),
  toggle: (postId: number) =>
    api.post<{ favorited: boolean }>(`/api/favorites/toggle/${postId}`),
}

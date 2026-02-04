import { api } from './client'

export interface NotificationCounts {
  communityCommentCount: number
  chatUnreadCount: number
}

export const notificationsApi = {
  getCounts: () => api.get<NotificationCounts>('/api/notifications/counts'),
}

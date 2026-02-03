import { api } from './client'

export interface ChatRoomItem {
  roomId: number
  postId: number
  postTitle: string
  postImageUrl: string | null
  postPrice: number | null
  postStatus: string
  otherNickname: string
  otherUserId: number
  lastMessage: string | null
  lastAt: string | null
}

export interface ChatRoomDetail {
  roomId: number
  postId: number
  postTitle: string
  postImageUrl: string | null
  postPrice: number | null
  postStatus: string
  otherNickname: string
  otherUserId: number
}

export interface ChatMessage {
  id: number
  userId: number
  nickname: string
  content: string
  createdAt: string
}

export const chatApi = {
  getOrCreateRoom: (postId: number) =>
    api.post<{ roomId: number }>('/api/chat/rooms', { postId }),

  getRoomList: () => api.get<{ rooms: ChatRoomItem[] }>('/api/chat/rooms'),

  getRoomDetail: (roomId: number) =>
    api.get<ChatRoomDetail>(`/api/chat/rooms/${roomId}`),

  getMessages: (roomId: number, params?: { limit?: number; beforeId?: number }) =>
    api.get<{ messages: ChatMessage[] }>(`/api/chat/rooms/${roomId}/messages`, { params }),

  sendMessage: (roomId: number, content: string) =>
    api.post<{ messageId: number }>(`/api/chat/rooms/${roomId}/messages`, { content }),
}

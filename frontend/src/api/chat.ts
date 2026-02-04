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
  /** 상대가 보낸 읽지 않은 메시지 수 (방별 배지용) */
  unreadCount: number
}

export interface ChatRoomDetail {
  roomId: number
  postId: number
  postTitle: string
  postImageUrl: string | null
  postPrice: number | null
  postStatus: string
  /** 현재 사용자가 해당 게시글 작성자(판매자)인지 */
  isPostAuthor: boolean
  otherNickname: string
  otherUserId: number
}

export interface ChatMessage {
  id: number
  userId: number
  nickname: string
  content: string
  /** text | image | appointment */
  messageType?: string
  createdAt: string
}

export interface ChatRoomByPostItem {
  roomId: number
  otherNickname: string
  otherUserId: number
  lastMessage: string | null
  lastAt: string | null
}

export const chatApi = {
  getOrCreateRoom: (postId: number) =>
    api.post<{ roomId: number }>('/api/chat/rooms', { postId }),

  getRoomList: () => api.get<{ rooms: ChatRoomItem[] }>('/api/chat/rooms'),

  /** 해당 게시글에 대한 대화중인 채팅방 목록 */
  getRoomsByPostId: (postId: number) =>
    api.get<{ rooms: ChatRoomByPostItem[] }>(`/api/chat/posts/${postId}/rooms`),

  getRoomDetail: (roomId: number) =>
    api.get<ChatRoomDetail>(`/api/chat/rooms/${roomId}`),

  getMessages: (roomId: number, params?: { limit?: number; beforeId?: number }) =>
    api.get<{ messages: ChatMessage[] }>(`/api/chat/rooms/${roomId}/messages`, { params }),

  sendMessage: (roomId: number, content: string, type?: 'text' | 'image') =>
    api.post<{ messageId: number }>(`/api/chat/rooms/${roomId}/messages`, { content, type: type ?? 'text' }),

  /** 약속잡기 (게시글 주인만) */
  createAppointment: (roomId: number, payload: { date: string; time: string; place: string }) =>
    api.post<{ messageId: number }>(`/api/chat/rooms/${roomId}/appointments`, payload),

  /** 해당 방 읽음 처리 (배지 제거) */
  markRoomRead: (roomId: number) =>
    api.post<{ ok: boolean }>(`/api/chat/rooms/${roomId}/read`),

  /** 채팅방 나가기 */
  leaveRoom: (roomId: number) =>
    api.post<{ ok: boolean }>(`/api/chat/rooms/${roomId}/leave`),
}

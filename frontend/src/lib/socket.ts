import { io, Socket } from 'socket.io-client'

export type SocketConnectionStatus = 'connected' | 'disconnected' | 'error'

const getSocketUrl = () => {
  const base = import.meta.env.VITE_API_URL || ''
  if (base) return base
  return window.location.origin
}

let socket: Socket | null = null
const connectionStatusListeners = new Set<(status: SocketConnectionStatus) => void>()

function notifyConnectionStatus(status: SocketConnectionStatus) {
  connectionStatusListeners.forEach((fn) => fn(status))
}

export function addSocketConnectionListener(fn: (status: SocketConnectionStatus) => void): () => void {
  connectionStatusListeners.add(fn)
  return () => connectionStatusListeners.delete(fn)
}

function attachConnectionListeners(s: Socket) {
  s.on('connect', () => notifyConnectionStatus('connected'))
  s.on('disconnect', () => notifyConnectionStatus('disconnected'))
  s.on('connect_error', () => notifyConnectionStatus('error'))
}

export function getChatSocket(token: string | null): Socket | null {
  if (!token) return null
  if (socket?.connected) return socket
  const url = getSocketUrl()
  socket = io(url, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
  })
  attachConnectionListeners(socket)
  return socket
}

export function disconnectChatSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export type ChatMessagePayload = {
  id: number
  userId: number
  nickname: string
  content: string
  messageType?: string
  createdAt: string
}

export type CommunityCommentPayload = {
  id: number
  userId: number
  nickname: string
  content: string
  createdAt: string
}

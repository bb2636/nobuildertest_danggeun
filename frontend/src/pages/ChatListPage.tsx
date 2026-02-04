import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { chatApi, type ChatRoomItem } from '../api/chat'
import { getChatSocket } from '../lib/socket'
import { useSocketConnectionBanner } from '../hooks/useSocketConnectionBanner'
import ImageWithFallback from '../components/ImageWithFallback'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { formatPrice, formatRelativeTime } from '../utils/format'
import { toAbsoluteImageUrl } from '../utils/image'

export default function ChatListPage() {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const { disconnectMessage, reconnectMessage } = useSocketConnectionBanner(token)
  const [rooms, setRooms] = useState<ChatRoomItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] })
  }, [queryClient])

  const fetchRooms = useCallback(() => {
    setError('')
    setLoading(true)
    chatApi
      .getRoomList()
      .then((res) => setRooms(res.data.rooms ?? []))
      .catch(() => {
        setRooms([])
        setError('채팅 목록을 불러오지 못했어요.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  useEffect(() => {
    if (!token) return
    const socket = getChatSocket(token)
    if (!socket) return
    const onChatListUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] })
      chatApi.getRoomList().then((res) => setRooms(res.data.rooms ?? [])).catch(() => setError('채팅 목록을 불러오지 못했어요.'))
    }
    socket.on('chat_list_updated', onChatListUpdated)
    return () => {
      socket.off('chat_list_updated', onChatListUpdated)
    }
  }, [token, queryClient])

  return (
    <div className="min-h-screen bg-grey-50 flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3">
        <h1 className="text-subhead text-gray-100 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-point-0" />
          채팅
        </h1>
      </header>
      <main className="flex-1 overflow-auto">
        {disconnectMessage && (
          <div className="bg-amber-500/90 text-white text-body-12 px-4 py-2 text-center" role="status">
            {disconnectMessage}
          </div>
        )}
        {reconnectMessage && (
          <div className="bg-point-0/90 text-white text-body-12 px-4 py-2 text-center" role="status">
            다시 연결되었습니다.
          </div>
        )}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <span className="text-body-14 text-gray-60">로딩 중...</span>
          </div>
        )}
        {error && (
          <div className="py-8 px-4 text-center">
            <p className="text-body-14 text-error mb-3">{error}</p>
            <button
              type="button"
              onClick={fetchRooms}
              className="px-4 py-2 rounded-lg bg-point-0 text-white text-body-14 font-medium"
            >
              다시 시도
            </button>
          </div>
        )}
        {!loading && !error && rooms.length === 0 && (
          <div className="py-12 text-center text-body-14 text-gray-60">
            나눈 채팅이 없어요.
          </div>
        )}
        {!loading && !error && rooms.length > 0 && (
          <ul className="divide-y divide-gray-10 bg-white">
            {rooms.map((room) => (
              <li key={room.roomId}>
                <Link
                  to={`/chat/${room.roomId}`}
                  className="flex gap-3 p-4 hover:bg-grey-50 transition-colors block"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-light">
                    <ImageWithFallback
                      src={toAbsoluteImageUrl(room.postImageUrl)}
                      alt=""
                      className="w-full h-full object-cover"
                      aspectRatio="square"
                      fallbackText=""
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-16 font-medium text-gray-100 truncate">
                      {room.otherNickname}
                    </p>
                    <p className="text-body-14 text-gray-60 truncate mt-0.5">
                      {room.postTitle}
                    </p>
                    <p className="text-body-12 text-point-0 mt-0.5">
                      {formatPrice(room.postPrice)}
                    </p>
                    {room.lastMessage && (
                      <p className="text-body-12 text-gray-50 truncate mt-0.5">
                        {/^https?:\/\/.+\/uploads\/.+/i.test(room.lastMessage)
                          ? '이미지를 보냈습니다.'
                          : room.lastMessage}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {room.lastAt && (
                      <span className="text-body-12 text-gray-40">
                        {formatRelativeTime(room.lastAt)}
                      </span>
                    )}
                    {(room.unreadCount ?? 0) > 0 && (
                      <span
                        className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-point-0 text-white text-body-12 font-medium"
                        aria-label={`읽지 않은 메시지 ${room.unreadCount}건`}
                      >
                        {room.unreadCount > 99 ? '99+' : room.unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

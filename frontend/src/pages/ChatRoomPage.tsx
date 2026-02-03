import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { chatApi, type ChatMessage, type ChatRoomDetail } from '../api/chat'
import { getChatSocket, type ChatMessagePayload } from '../lib/socket'
import { useSocketConnectionBanner } from '../hooks/useSocketConnectionBanner'
import ImageWithFallback from '../components/ImageWithFallback'
import Spinner from '../components/Spinner'
import { formatPrice, formatMessageTime } from '../utils/format'

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const { disconnectMessage, reconnectMessage } = useSocketConnectionBanner(token)
  const [roomDetail, setRoomDetail] = useState<ChatRoomDetail | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const id = roomId ? parseInt(roomId, 10) : NaN

  // 방 정보(게시글) 로드
  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) return
    let cancelled = false
    chatApi
      .getRoomDetail(id)
      .then((res) => {
        if (!cancelled) setRoomDetail(res.data)
      })
      .catch(() => {
        if (!cancelled) setRoomDetail(null)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // 초기 메시지 로드 (REST)
  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) {
      setLoading(false)
      return
    }
    let cancelled = false
    chatApi
      .getMessages(id)
      .then((res) => {
        if (!cancelled) setMessages(res.data.messages ?? [])
      })
      .catch(() => {
        if (!cancelled) navigate('/chat', { replace: true })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  // WebSocket: 방 입장, 새 메시지 수신
  useEffect(() => {
    if (!Number.isInteger(id) || id < 1 || !token) return
    const socket = getChatSocket(token)
    if (!socket) return

    socket.emit('join_room', { roomId: id })

    const onNewMessage = (msg: ChatMessagePayload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    socket.on('new_message', onNewMessage)

    return () => {
      socket.off('new_message', onNewMessage)
      socket.emit('leave_room', { roomId: id })
    }
  }, [id, token, user?.id])

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight)
  }, [messages])

  const handleSend = () => {
    const content = input.trim()
    if (!content || sending || !Number.isInteger(id)) return
    const socket = token ? getChatSocket(token) : null
    if (!socket?.connected) {
      setSendError('연결을 기다리는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    setSending(true)
    setInput('')
    setSendError('')
    socket.emit('send_message', { roomId: id, content }, (res: { ok?: boolean; message?: string }) => {
      setSending(false)
      if (res?.ok === false) {
        setSendError(res.message || '전송에 실패했습니다.')
      }
    })
  }

  if (!Number.isInteger(id) || id < 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-body-14 text-gray-60">올바른 채팅방이 아닙니다.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-body-14 text-gray-60">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-light"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-5 h-5 text-gray-100" />
        </button>
        <h1 className="text-subhead text-gray-100 flex-1 truncate">
          {roomDetail?.otherNickname ?? '채팅'}
        </h1>
      </header>

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

      {roomDetail && (
        <Link
          to={`/posts/${roomDetail.postId}`}
          className="flex gap-3 p-3 border-b border-gray-10 bg-grey-50 hover:bg-gray-10 transition-colors"
        >
          <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-light">
            <ImageWithFallback
              src={roomDetail.postImageUrl}
              alt=""
              className="w-full h-full object-cover"
              aspectRatio="square"
              fallbackText=""
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-14 font-medium text-gray-100 truncate">
              {roomDetail.postTitle}
            </p>
            <p className="text-body-14 text-point-0 mt-0.5">
              {formatPrice(roomDetail.postPrice)}
            </p>
          </div>
        </Link>
      )}

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
      >
        {messages.map((msg) => {
          const isMe = user?.id === msg.userId
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-body-14 ${
                  isMe
                    ? 'bg-point-0 text-white'
                    : 'bg-gray-10 text-gray-100'
                }`}
              >
                {!isMe && (
                  <p className="text-body-12 text-gray-60 mb-0.5">{msg.nickname}</p>
                )}
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p
                  className={`text-body-12 mt-0.5 ${
                    isMe ? 'text-point-2' : 'text-gray-50'
                  }`}
                >
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {sendError && (
        <p className="px-4 py-1 text-body-12 text-error">{sendError}</p>
      )}
      <div className="border-t border-gray-10 p-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="메시지를 입력하세요"
          className="flex-1 h-10 px-3 rounded-lg border border-gray-20 text-body-14 focus:outline-none focus:ring-2 focus:ring-point-0"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="h-10 px-4 rounded-lg bg-point-0 text-white flex items-center gap-1 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          전송
        </button>
      </div>
    </div>
  )
}

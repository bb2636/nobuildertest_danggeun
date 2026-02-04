import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, ChevronDown, ImagePlus, LogOut, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { chatApi, type ChatMessage, type ChatRoomDetail } from '../api/chat'
import { postsApi, type PostStatus } from '../api/posts'
import { uploadApi } from '../api/upload'
import { getChatSocket, type ChatMessagePayload } from '../lib/socket'
import { useSocketConnectionBanner } from '../hooks/useSocketConnectionBanner'
import ImageWithFallback from '../components/ImageWithFallback'
import Spinner from '../components/Spinner'
import { formatPrice, formatMessageTime } from '../utils/format'
import { STATUS_LABEL } from '../constants/post'

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, token } = useAuth()
  const { disconnectMessage, reconnectMessage } = useSocketConnectionBanner(token)
  const [roomDetail, setRoomDetail] = useState<ChatRoomDetail | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [leaveLoading, setLeaveLoading] = useState(false)
  const [appointmentOpen, setAppointmentOpen] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [appointmentPlace, setAppointmentPlace] = useState('')
  const [appointmentSubmitting, setAppointmentSubmitting] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [statusSheetOpen, setStatusSheetOpen] = useState(false)
  const [statusConfirmMessage, setStatusConfirmMessage] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const STATUS_CONFIRM_LABEL: Record<PostStatus, string> = {
    SALE: '판매중',
    RESERVED: '예약중',
    SOLD: '거래 완료',
  }

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

  // 방 입장 시 읽음 처리 (배지 제거)
  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) return
    chatApi.markRoomRead(id).then(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] })
    }).catch(() => {})
  }, [id, queryClient])

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

  const handleStatusChange = async (newStatus: PostStatus) => {
    if (!roomDetail || statusLoading || roomDetail.postStatus === newStatus) return
    setStatusLoading(true)
    setStatusSheetOpen(false)
    try {
      await postsApi.updateStatus(roomDetail.postId, newStatus)
      setRoomDetail((prev) => (prev ? { ...prev, postStatus: newStatus } : null))
      setStatusConfirmMessage(`상태가 ${STATUS_CONFIRM_LABEL[newStatus]}으로 변경됐어요`)
    } finally {
      setStatusLoading(false)
    }
  }

  const handleLeaveRoom = async () => {
    if (!Number.isInteger(id) || id < 1 || leaveLoading) return
    if (!window.confirm('채팅방을 나가시겠어요?')) return
    setLeaveLoading(true)
    try {
      await chatApi.leaveRoom(id)
      queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] })
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      navigate('/chat', { replace: true })
    } catch {
      setLeaveLoading(false)
    }
  }

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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/') || !Number.isInteger(id) || imageUploading) return
    setImageUploading(true)
    setSendError('')
    try {
      const { data } = await uploadApi.uploadImage(file)
      const url = data.url.startsWith('http') ? data.url : `${import.meta.env.VITE_API_URL ?? ''}${data.url}`
      const socket = token ? getChatSocket(token) : null
      if (!socket?.connected) {
        setSendError('연결을 기다리는 중입니다.')
        return
      }
      socket.emit('send_message', { roomId: id, content: url, type: 'image' }, (res: { ok?: boolean; message?: string }) => {
        if (res?.ok === false) setSendError(res.message || '이미지 전송에 실패했습니다.')
      })
    } catch {
      setSendError('이미지 업로드에 실패했습니다.')
    } finally {
      setImageUploading(false)
      e.target.value = ''
    }
  }

  const handleCreateAppointment = async () => {
    if (!roomDetail || !appointmentDate.trim() || !appointmentTime.trim() || !appointmentPlace.trim() || appointmentSubmitting) return
    setAppointmentSubmitting(true)
    setSendError('')
    try {
      await chatApi.createAppointment(id, {
        date: appointmentDate.trim(),
        time: appointmentTime.trim(),
        place: appointmentPlace.trim(),
      })
      const res = await chatApi.getMessages(id)
      setMessages(res.data.messages ?? [])
      setAppointmentOpen(false)
      setAppointmentDate('')
      setAppointmentTime('')
      setAppointmentPlace('')
    } catch (err: unknown) {
      setSendError((err as Error)?.message || '약속 등록에 실패했습니다.')
    } finally {
      setAppointmentSubmitting(false)
    }
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
        <div className="border-b border-gray-10 bg-grey-50">
          <Link
            to={`/posts/${roomDetail.postId}`}
            className="flex gap-3 p-3 hover:bg-gray-10 transition-colors"
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
              {roomDetail.isPostAuthor ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setStatusSheetOpen(true)
                  }}
                  disabled={statusLoading}
                  className="flex items-center gap-0.5 text-body-14 font-medium text-gray-100 hover:text-point-0"
                >
                  {STATUS_LABEL[roomDetail.postStatus] ?? roomDetail.postStatus}
                  <ChevronDown className="w-4 h-4 text-gray-50" />
                </button>
              ) : (
                <p className="text-body-14 font-medium text-gray-60">
                  {STATUS_LABEL[roomDetail.postStatus] ?? roomDetail.postStatus}
                </p>
              )}
              <p className="text-body-14 font-medium text-gray-100 truncate mt-0.5">
                {roomDetail.postTitle}
              </p>
              <p className="text-body-14 text-point-0 mt-0.5">
                {formatPrice(roomDetail.postPrice)}
              </p>
            </div>
          </Link>
          {roomDetail.isPostAuthor && (
            <div className="px-3 pb-2">
              <button
                type="button"
                onClick={() => setAppointmentOpen(true)}
                className="w-full h-10 rounded-lg border border-point-0 text-point-0 text-body-14 font-medium flex items-center justify-center gap-1.5 hover:bg-point-0/5"
              >
                <Calendar className="w-4 h-4" />
                약속잡기
              </button>
            </div>
          )}
          <div className="px-3 pb-3 pt-0">
            <button
              type="button"
              onClick={handleLeaveRoom}
              disabled={leaveLoading}
              className="w-full h-10 rounded-lg border border-gray-20 text-body-14 text-gray-70 flex items-center justify-center gap-1.5 hover:bg-gray-10 disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              {leaveLoading ? '나가는 중...' : '채팅방 나가기'}
            </button>
          </div>
        </div>
      )}

      {/* 판매 상태 변경 하단 액션시트 */}
      {statusSheetOpen && roomDetail && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setStatusSheetOpen(false)}
            aria-hidden
          />
          <div className="fixed bottom-0 left-0 right-0 z-30 max-w-mobile mx-auto bg-white rounded-t-2xl shadow-lg pb-safe">
            <div className="p-2 border-b border-gray-10">
              <div className="w-8 h-1 rounded-full bg-gray-20 mx-auto" aria-hidden />
            </div>
            <ul className="py-2">
              {(['SALE', 'RESERVED', 'SOLD'] as const).map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    disabled={statusLoading || roomDetail.postStatus === s}
                    className="w-full py-3.5 px-4 text-body-16 text-gray-100 text-left hover:bg-grey-50 active:bg-gray-10 disabled:opacity-50 disabled:cursor-default"
                  >
                    {s === 'SOLD' ? '거래완료' : STATUS_LABEL[s]}
                  </button>
                </li>
              ))}
              <li className="border-t border-gray-10">
                <button
                  type="button"
                  onClick={() => setStatusSheetOpen(false)}
                  className="w-full py-3.5 px-4 text-body-16 text-gray-60"
                >
                  닫기
                </button>
              </li>
            </ul>
          </div>
        </>
      )}

      {/* 상태 변경 확인 팝업 */}
      {statusConfirmMessage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-[280px] w-full overflow-hidden">
            <p className="px-6 pt-6 pb-4 text-body-16 text-gray-100 text-center">
              {statusConfirmMessage}
            </p>
            <button
              type="button"
              onClick={() => setStatusConfirmMessage(null)}
              className="w-full h-12 bg-point-0 text-white text-body-16 font-medium"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {appointmentOpen && roomDetail && (
        <div className="fixed inset-0 z-30 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 pb-safe max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-subhead text-gray-100">약속 잡기</h2>
              <button
                type="button"
                onClick={() => setAppointmentOpen(false)}
                className="p-2 rounded-full hover:bg-gray-10 text-gray-60"
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <p className="text-body-12 text-gray-60 mb-3">{roomDetail.otherNickname}님과의 거래 약속을 정해보세요.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-body-12 text-gray-60 mb-1">날짜</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-20 text-body-14"
                />
              </div>
              <div>
                <label className="block text-body-12 text-gray-60 mb-1">시간</label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-20 text-body-14"
                />
              </div>
              <div>
                <label className="block text-body-12 text-gray-60 mb-1">장소</label>
                <input
                  type="text"
                  value={appointmentPlace}
                  onChange={(e) => setAppointmentPlace(e.target.value)}
                  placeholder="만날 장소를 입력하세요"
                  className="w-full h-11 px-3 rounded-lg border border-gray-20 text-body-14 placeholder:text-gray-40"
                />
              </div>
            </div>
            {sendError && <p className="text-body-12 text-error mt-2">{sendError}</p>}
            <button
              type="button"
              onClick={handleCreateAppointment}
              disabled={appointmentSubmitting || !appointmentDate || !appointmentTime || !appointmentPlace.trim()}
              className="w-full h-12 mt-4 rounded-lg bg-point-0 text-white font-medium text-body-14 disabled:opacity-50"
            >
              {appointmentSubmitting ? '등록 중...' : '완료'}
            </button>
          </div>
        </div>
      )}

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
      >
        {messages.map((msg) => {
          const isMe = user?.id === msg.userId
          const type = msg.messageType || 'text'
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
                {type === 'image' && (
                  <a href={msg.content} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={msg.content} alt="전송된 이미지" className="max-w-full max-h-64 rounded object-contain" />
                  </a>
                )}
                {type === 'appointment' && (() => {
                  try {
                    const { date, time, place } = JSON.parse(msg.content) as { date?: string; time?: string; place?: string }
                    return (
                      <div className="bg-white/10 rounded-lg p-2 min-w-[200px]">
                        <p className="text-body-12 font-medium mb-1">약속을 만들었어요.</p>
                        <p className="text-body-12">날짜: {date ?? '-'}</p>
                        <p className="text-body-12">시간: {time ?? '-'}</p>
                        <p className="text-body-12">장소: {place ?? '-'}</p>
                      </div>
                    )
                  } catch {
                    return <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  }
                })()}
                {type !== 'image' && type !== 'appointment' && (
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                )}
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
      <div className="border-t border-gray-10 p-2 flex gap-2 items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleImageSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={imageUploading}
          className="p-2 rounded-lg text-gray-60 hover:bg-gray-10 disabled:opacity-50"
          aria-label="사진 첨부"
        >
          <ImagePlus className="w-5 h-5" />
        </button>
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

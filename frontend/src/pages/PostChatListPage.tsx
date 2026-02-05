import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { chatApi, type ChatRoomByPostItem } from '../api/chat'
import { postsApi } from '../api/posts'
import Spinner from '../components/Spinner'
import { formatRelativeTime } from '../utils/format'

export default function PostChatListPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const postId = id ? parseInt(id, 10) : NaN
  const idValid = Number.isInteger(postId) && postId >= 1

  const { data: post } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.getDetail(postId).then((res) => res.data),
    enabled: idValid,
  })

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['chat', 'post-rooms', postId],
    queryFn: () => chatApi.getRoomsByPostId(postId).then((res) => res.data.rooms ?? []),
    enabled: idValid,
  })

  if (!idValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-body-14 text-gray-60">올바른 게시글이 아닙니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-light"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-5 h-5 text-gray-100" />
        </button>
        <h1 className="text-subhead text-gray-100 flex-1 truncate">
          대화중인 채팅
        </h1>
      </header>

      <main className="flex-1">
        {post && (
          <div className="px-4 py-3 border-b border-gray-10 bg-grey-50">
            <p className="text-body-12 text-gray-60">해당 게시글</p>
            <Link
              to={`/posts/${post.id}`}
              className="text-body-14 font-medium text-gray-100 mt-0.5 block hover:text-point-0"
            >
              {post.title}
            </Link>
          </div>
        )}

        {roomsLoading && (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {!roomsLoading && rooms.length === 0 && (
          <div className="py-12 text-center text-body-14 text-gray-60">
            이 게시글에 대한 대화중인 채팅이 없어요.
          </div>
        )}

        {!roomsLoading && rooms.length > 0 && (
          <ul className="divide-y divide-gray-10">
            {rooms.map((room: ChatRoomByPostItem) => (
              <li key={room.roomId}>
                <Link
                  to={`/chat/${room.roomId}`}
                  className="flex items-center gap-3 p-4 hover:bg-grey-50 active:bg-gray-10"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-gray-50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-16 font-medium text-gray-100">
                      {room.otherNickname}
                    </p>
                    <p className="text-body-12 text-gray-50 truncate mt-0.5">
                      {room.lastMessage ?? '메시지 없음'}
                    </p>
                  </div>
                  <div className="text-body-12 text-gray-40 flex-shrink-0">
                    {room.lastAt ? formatRelativeTime(room.lastAt) : ''}
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

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Eye, Heart, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { chatApi } from '../api/chat'
import { favoritesApi } from '../api/favorites'
import { postsApi, PostDetail, PostStatus } from '../api/posts'
import ImageGallery from '../components/ImageGallery'
import Spinner from '../components/Spinner'
import { formatPrice } from '../utils/format'
import { STATUS_LABEL } from '../constants/post'
import { getApiErrorMessage } from '../utils/apiError'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const postId = id ? parseInt(id, 10) : NaN
  const idValid = Number.isInteger(postId) && postId >= 1

  const { data: postData, isLoading: loading, isError: isListError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.getDetail(postId).then((res) => res.data),
    enabled: idValid,
  })
  const post = postData ?? null
  const error = !idValid ? '올바른 게시글이 아닙니다.' : isListError ? '게시글을 불러오지 못했습니다.' : ''

  if (idValid && loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-body-14 text-gray-60">로딩 중...</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <p className="text-body-14 text-error mb-4">{error || '게시글을 찾을 수 없습니다.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-point-0 font-semibold text-body-14"
        >
          목록으로
        </button>
      </div>
    )
  }

  const isOwner = user?.id === post.userId
  const [status, setStatus] = useState<PostStatus>(post.status)
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [favorited, setFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [favoriteError, setFavoriteError] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    if (!user || isOwner) return
    favoritesApi.check(post.id).then((res) => setFavorited(res.data.favorited)).catch(() => {})
  }, [user, isOwner, post.id])

  const handleFavoriteToggle = async () => {
    if (favoriteLoading) return
    setFavoriteError('')
    setFavoriteLoading(true)
    try {
      const res = await favoritesApi.toggle(post.id)
      setFavorited(res.data.favorited)
    } catch (err: unknown) {
      setFavoriteError(getApiErrorMessage(err, '찜 상태를 변경하지 못했습니다.'))
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleChat = async () => {
    if (chatLoading) return
    setChatLoading(true)
    try {
      const res = await chatApi.getOrCreateRoom(post.id)
      navigate(`/chat/${res.data.roomId}`)
    } catch {
      setChatLoading(false)
    }
  }

  useEffect(() => {
    setStatus(post.status)
  }, [post.status])

  const handleStatusChange = async (newStatus: PostStatus) => {
    if (newStatus === status || statusLoading) return
    setStatusLoading(true)
    try {
      await postsApi.updateStatus(post.id, newStatus)
      setStatus(newStatus)
    } catch {
      // ignore
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제할까요?')) return
    setDeleteError('')
    setDeleteLoading(true)
    try {
      await postsApi.delete(post.id)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, '삭제에 실패했습니다.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-light transition-colors"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-5 h-5 text-gray-100" />
        </button>
        <h1 className="text-subhead text-gray-100 truncate flex-1">게시글</h1>
      </header>

      <main className="flex-1 pb-6">
        {/* 이미지 갤러리 (스와이프 + 인디케이터) */}
        <ImageGallery urls={post.imageUrls} />

        {/* 판매자·가격·상태 */}
        <div className="px-4 pt-4 border-b border-gray-10 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-body-14 text-gray-60">{post.userNickname}</span>
            {post.locationName && (
              <span className="text-body-12 text-gray-60 flex items-center gap-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {post.locationName}
              </span>
            )}
          </div>
          <h2 className="text-title-3 text-gray-100 mt-2">{post.title}</h2>
          <p className="text-body-16 font-medium text-gray-100 mt-1">
            {formatPrice(post.price)}
          </p>
          <div className="flex items-center gap-2 mt-2 text-body-12 text-gray-60 flex-wrap">
            {isOwner ? (
              <span className="flex items-center gap-1.5">
                {(['SALE', 'RESERVED', 'SOLD'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    disabled={statusLoading || status === s}
                    className={`px-2 py-0.5 rounded text-body-12 font-medium transition-colors ${
                      status === s
                        ? 'bg-point-0 text-white'
                        : 'bg-gray-10 text-gray-70 hover:bg-gray-20'
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </span>
            ) : (
              <span>{STATUS_LABEL[status] ?? status}</span>
            )}
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Eye className="w-3.5 h-3.5" />
              조회 {post.viewCount}
            </span>
            {post.createdAt && (
              <>
                <span>·</span>
                <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
              </>
            )}
          </div>
        </div>

        {/* 본문 */}
        {post.content && (
          <div className="px-4 py-4">
            <p className="text-body-16 text-gray-100 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        )}

        {/* 찜·채팅 (본인이 올린 글이 아닐 때) */}
        {!isOwner && (
          <div className="px-4 py-3 flex flex-col gap-2 border-t border-gray-10">
            {favoriteError && (
              <p className="text-body-14 text-error" role="alert">{favoriteError}</p>
            )}
            <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading}
              className="flex-1 h-12 rounded-lg border border-gray-20 text-body-14 font-medium flex items-center justify-center gap-2"
            >
              <Heart
                className={`w-5 h-5 ${favorited ? 'fill-point-0 text-point-0' : 'text-gray-60'}`}
              />
              {favorited ? '찜 해제' : '찜하기'}
            </button>
            <button
              type="button"
              onClick={handleChat}
              disabled={chatLoading}
              className="flex-1 h-12 rounded-lg bg-point-0 text-white text-body-14 font-medium flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              {chatLoading ? '연결 중...' : '채팅하기'}
            </button>
            </div>
          </div>
        )}

        {/* 본인 게시글일 때 액션 */}
        {isOwner && (
          <div className="px-4 pt-4 flex flex-col gap-2">
            {deleteError && (
              <p className="text-body-14 text-error" role="alert">{deleteError}</p>
            )}
            <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/posts/${post.id}/edit`)}
              className="flex-1 h-12 rounded-lg border border-gray-20 text-body-14 font-medium text-gray-100"
            >
              수정하기
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 h-12 rounded-lg border border-error text-error text-body-14 font-medium disabled:opacity-60"
            >
              {deleteLoading ? '삭제 중...' : '삭제하기'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 h-12 rounded-lg bg-point-0 text-white text-body-14 font-medium"
            >
              목록으로
            </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

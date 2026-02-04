import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Eye, Heart, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { chatApi } from '../api/chat'
import { favoritesApi } from '../api/favorites'
import { postsApi, PostListItem, PostStatus } from '../api/posts'
import ImageGallery from '../components/ImageGallery'
import ImageWithFallback from '../components/ImageWithFallback'
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

  const [status, setStatus] = useState<PostStatus>('SALE')
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [favorited, setFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [favoriteError, setFavoriteError] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const { data: postData, isLoading: loading, isError: isListError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.getDetail(postId).then((res) => res.data),
    enabled: idValid,
  })
  const post = postData ?? null
  const error = !idValid ? '올바른 게시글이 아닙니다.' : isListError ? '게시글을 불러오지 못했습니다.' : ''
  const isOwner = post ? user?.id === post.userId : false

  const { data: myPostsData } = useQuery({
    queryKey: ['posts', 'my', post?.userId],
    queryFn: () => postsApi.getList({ my: true, limit: 20 }).then((res) => res.data),
    enabled: isOwner && !!post?.userId,
  })
  const myOtherPosts: PostListItem[] = (myPostsData?.posts ?? []).filter((p) => p.id !== postId)

  const { data: postRoomsData } = useQuery({
    queryKey: ['chat', 'post-rooms', postId],
    queryFn: () => chatApi.getRoomsByPostId(postId).then((res) => res.data.rooms ?? []),
    enabled: idValid && !!post?.id,
  })
  const postRooms = postRoomsData ?? []

  useEffect(() => {
    if (post) setStatus(post.status)
  }, [post?.status])

  useEffect(() => {
    if (!user || !post || isOwner) return
    favoritesApi.check(post.id).then((res) => setFavorited(res.data.favorited)).catch(() => {})
  }, [user, isOwner, post?.id])

  const handleFavoriteToggle = async () => {
    if (favoriteLoading || !post) return
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
    if (chatLoading || !post) return
    setChatLoading(true)
    try {
      const res = await chatApi.getOrCreateRoom(post.id)
      navigate(`/chat/${res.data.roomId}`)
    } catch {
      setChatLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: PostStatus) => {
    if (newStatus === status || statusLoading || !post) return
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
    if (!post || !window.confirm('정말 삭제할까요?')) return
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

  const showContent = !loading && post && !error

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {idValid && loading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-body-14 text-gray-60">로딩 중...</p>
        </div>
      )}

      {!loading && (error || !post) && (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <p className="text-body-14 text-error mb-4">{error || '게시글을 찾을 수 없습니다.'}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-point-0 font-semibold text-body-14"
          >
            목록으로
          </button>
        </div>
      )}

      {/* 항상 마운트하여 훅 개수 유지 (조건부 마운트 시 ImageGallery 훅 오류 방지) */}
      <div className={showContent ? undefined : 'hidden'}>
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
          <ImageGallery urls={post?.imageUrls ?? []} />

          {post && (
            <>
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

              {post.content && (
                <div className="px-4 py-4">
                  <p className="text-body-16 text-gray-100 whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              )}

              {isOwner && myOtherPosts.length > 0 && (
                <div className="px-4 py-4 border-t border-gray-10">
                  <h3 className="text-body-14 font-medium text-gray-100 mb-3">
                    {post.userNickname}님의 판매 물품
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                    {myOtherPosts.map((p) => (
                      <Link
                        key={p.id}
                        to={`/posts/${p.id}`}
                        className="flex-shrink-0 w-28"
                      >
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-light">
                          <ImageWithFallback
                            src={p.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            aspectRatio="square"
                            fallbackText=""
                          />
                        </div>
                        <p className="text-body-12 text-gray-100 mt-1 truncate">{p.title}</p>
                        <p className="text-body-14 font-medium text-point-0">{formatPrice(p.price)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {isOwner && postRooms.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-10">
                  <Link
                    to={`/posts/${post.id}/chats`}
                    className="w-full h-12 rounded-lg bg-point-0 text-white text-body-14 font-medium flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    대화 중인 채팅 {postRooms.length}
                  </Link>
                </div>
              )}

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
            </>
          )}
        </main>
      </div>
    </div>
  )
}

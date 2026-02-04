import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, MessageSquare, Send, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { communityApi, type CommunityPostDetail, type CommunityComment } from '../api/community'
import { getChatSocket, type CommunityCommentPayload } from '../lib/socket'
import Spinner from '../components/Spinner'
import { formatRelativeTime } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'

export default function CommunityPostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [post, setPost] = useState<CommunityPostDetail | null>(null)
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const postId = id ? parseInt(id, 10) : NaN

  useEffect(() => {
    if (!Number.isInteger(postId) || postId < 1) {
      setLoading(false)
      return
    }
    let cancelled = false
    Promise.all([
      communityApi.getDetail(postId),
      communityApi.getComments(postId),
    ])
      .then(([postRes, commentsRes]) => {
        if (!cancelled) {
          setPost(postRes.data)
          setComments(commentsRes.data.comments ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) setPost(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [postId])

  // 동네생활 댓글 실시간 반영: 소켓으로 새 댓글 수신
  const onCommunityCommentAdded = useCallback((payload: CommunityCommentPayload) => {
    setComments((prev) => {
      if (prev.some((c) => c.id === payload.id)) return prev
      return [
        ...prev,
        {
          id: payload.id,
          userId: payload.userId,
          nickname: payload.nickname,
          content: payload.content,
          createdAt: payload.createdAt,
        },
      ]
    })
    setPost((p) => (p ? { ...p, commentCount: p.commentCount + 1 } : null))
  }, [])

  useEffect(() => {
    if (!Number.isInteger(postId) || postId < 1 || !token) return
    const socket = getChatSocket(token)
    if (!socket) return
    socket.emit('join_community_post', { postId })
    socket.on('community_comment_added', onCommunityCommentAdded)
    return () => {
      socket.off('community_comment_added', onCommunityCommentAdded)
      socket.emit('leave_community_post', { postId })
    }
  }, [postId, token, onCommunityCommentAdded])

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight)
  }, [comments])

  const handleSubmitComment = async () => {
    const content = commentInput.trim()
    if (!content || commentLoading || !Number.isInteger(postId)) return
    setCommentError('')
    setCommentLoading(true)
    const prevInput = commentInput
    setCommentInput('')
    try {
      const { data } = await communityApi.createComment(postId, content)
      setComments((prev) => [
        ...prev,
        {
          id: data.id,
          userId: data.userId,
          nickname: data.nickname,
          content: data.content,
          createdAt: data.createdAt,
        },
      ])
      if (post) {
        setPost({ ...post, commentCount: post.commentCount + 1 })
      }
    } catch (err: unknown) {
      setCommentError(getApiErrorMessage(err, '댓글 등록에 실패했습니다.'))
      setCommentInput(prevInput)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('글을 삭제할까요?')) return
    setDeleteError('')
    setDeleteLoading(true)
    try {
      await communityApi.delete(postId)
      navigate('/community', { replace: true })
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, '삭제에 실패했습니다.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-body-14 text-gray-60">로딩 중...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-body-14 text-gray-60">글을 찾을 수 없습니다.</p>
        <button
          type="button"
          onClick={() => navigate('/community')}
          className="mt-4 text-point-0 font-semibold text-body-14"
        >
          목록으로
        </button>
      </div>
    )
  }

  const isOwner = user?.id === post.userId

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/community')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-light"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-5 h-5 text-gray-100" />
        </button>
        <h1 className="text-subhead text-gray-100 flex-1 truncate">동네생활</h1>
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        <article className="px-4 py-4 border-b border-gray-10 flex-shrink-0">
          {post.topic && (
            <span className="inline-flex px-2.5 py-1 rounded-md bg-gray-10 text-body-14 text-gray-70 mb-2">
              {post.topic}
            </span>
          )}
          <h2 className="text-title-3 text-gray-100">{post.title}</h2>
          <div className="flex items-center gap-2 mt-2 text-body-12 text-gray-60">
            {post.locationName && (
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {post.locationName}
              </span>
            )}
            <span>{post.userNickname}</span>
            <span>·</span>
            <span>{formatRelativeTime(post.createdAt)}</span>
            <span className="flex items-center gap-0.5 ml-auto">
              <Eye className="w-3.5 h-3.5" />
              조회 {post.viewCount ?? 0}
            </span>
          </div>
          {post.content && (
            <p className="text-body-16 text-gray-100 mt-4 whitespace-pre-wrap">
              {post.content}
            </p>
          )}
          {deleteError && (
            <p className="text-body-14 text-error mt-2">{deleteError}</p>
          )}
          {isOwner && (
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => navigate(`/community/${post.id}/edit`)}
                className="text-body-14 text-gray-70"
              >
                수정
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="text-body-14 text-error disabled:opacity-60"
              >
                삭제
              </button>
            </div>
          )}
        </article>

        <section className={`flex-1 flex flex-col min-h-0 border-t border-gray-10 ${user ? 'pb-20' : ''}`}>
          <div className="px-4 py-2 border-b border-gray-10 flex items-center gap-1.5 text-body-14 text-gray-70">
            <MessageSquare className="w-4 h-4" />
            댓글 {post.commentCount}
          </div>
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-3 pb-24 flex flex-col gap-3 min-h-0"
          >
            {comments.map((c) => (
              <div key={c.id} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 text-body-12 text-gray-60">
                  <span className="font-medium text-gray-80">{c.nickname}</span>
                  <span>{formatRelativeTime(c.createdAt)}</span>
                </div>
                <p className="text-body-14 text-gray-100 whitespace-pre-wrap">
                  {c.content}
                </p>
              </div>
            ))}
          </div>

          {commentError && (
            <p className="px-4 py-1 text-body-12 text-error">{commentError}</p>
          )}
        </section>

        {user && (
          <div
            className="fixed left-0 right-0 bottom-16 z-20 max-w-mobile mx-auto bg-white border-t border-gray-10 p-2 flex gap-2"
            style={{ maxWidth: 'var(--max-w-mobile, 420px)' }}
          >
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
              placeholder="댓글을 입력하세요"
              className="flex-1 h-10 px-3 rounded-lg border border-gray-20 text-body-14 focus:outline-none focus:ring-2 focus:ring-point-0"
            />
            <button
              type="button"
              onClick={handleSubmitComment}
              disabled={!commentInput.trim() || commentLoading}
              className="h-10 px-4 rounded-lg bg-point-0 text-white flex items-center gap-1 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              등록
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

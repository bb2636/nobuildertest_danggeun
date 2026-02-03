import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { communityApi } from '../api/community'
import Spinner from '../components/Spinner'
import { getApiErrorMessage } from '../utils/apiError'

export default function CommunityPostFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isEdit = Boolean(id)
  const postId = id ? parseInt(id, 10) : 0

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingPost, setLoadingPost] = useState(isEdit)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    if (!isEdit || !Number.isInteger(postId) || postId < 1) {
      setLoadingPost(false)
      return
    }
    let cancelled = false
    setLoadFailed(false)
    setLoadingPost(true)
    communityApi
      .getDetail(postId)
      .then((res) => {
        if (!cancelled) {
          setTitle(res.data.title)
          setContent(res.data.content ?? '')
          setLoadingPost(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true)
          setLoadingPost(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [isEdit, postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('제목을 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await communityApi.update(postId, { title: trimmedTitle, content: content.trim() || null })
        navigate(`/community/${postId}`, { replace: true })
      } else {
        const { data } = await communityApi.create({
          title: trimmedTitle,
          content: content.trim() || null,
          locationName: user?.locationName ?? null,
          locationCode: user?.locationCode ?? null,
        })
        navigate(`/community/${data.id}`, { replace: true })
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, isEdit ? '수정에 실패했습니다.' : '작성에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  if (isEdit && loadFailed) {
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
          <h1 className="text-subhead text-gray-100">글 수정</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-body-16 text-gray-80 mb-4">글을 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-point-0 font-semibold text-body-14"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    )
  }

  if (isEdit && loadingPost) {
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
          <h1 className="text-subhead text-gray-100">글 수정</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-body-14 text-gray-60">로딩 중...</p>
        </div>
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
        <h1 className="text-subhead text-gray-100">
          {isEdit ? '글 수정' : '동네생활 글쓰기'}
        </h1>
      </header>
      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 flex flex-col gap-4">
        <div>
          <label htmlFor="community-title" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            제목 *
          </label>
          <input
            id="community-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={200}
            className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0"
            required
          />
        </div>
        <div>
          <label htmlFor="community-content" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            내용
          </label>
          <textarea
            id="community-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="동네 이웃에게 하고 싶은 말을 적어보세요"
            rows={8}
            className="w-full px-4 py-3 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 resize-none"
          />
        </div>
        {user?.locationName && (
          <p className="text-body-12 text-gray-60">동네: {user.locationName}</p>
        )}
        {error && (
          <p className="text-body-14 text-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 rounded-lg bg-point-0 text-white font-semibold text-body-16 disabled:opacity-60"
        >
          {loading ? '처리 중...' : isEdit ? '수정하기' : '등록하기'}
        </button>
      </form>
    </div>
  )
}

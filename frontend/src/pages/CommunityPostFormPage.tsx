import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { communityApi } from '../api/community'
import { COMMUNITY_TOPIC_GROUPS } from '../constants/community'
import Spinner from '../components/Spinner'
import NoticeBox from '../components/NoticeBox'
import FieldErrorTooltip from '../components/FieldErrorTooltip'
import { getApiErrorMessage } from '../utils/apiError'

export default function CommunityPostFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isEdit = Boolean(id)
  const postId = id ? parseInt(id, 10) : 0

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [topic, setTopic] = useState('')
  const [topicModalOpen, setTopicModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ title?: string }>({})
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
          setTopic(res.data.topic ?? '')
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
    setFieldErrors({})
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setFieldErrors({ title: '제목을 입력해주세요.' })
      return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await communityApi.update(postId, {
          title: trimmedTitle,
          content: content.trim() || null,
          topic: topic.trim() || null,
        })
        navigate(`/community/${postId}`, { replace: true })
      } else {
        const { data } = await communityApi.create({
          title: trimmedTitle,
          content: content.trim() || null,
          topic: topic.trim() || null,
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
      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 flex flex-col gap-4" noValidate>
        <NoticeBox title="안내">
          중고거래 관련, 명예훼손, 광고/홍보 목적의 글은 올리실 수 없어요.
        </NoticeBox>
        <div>
          <label className="block text-body-14 font-medium text-gray-100 mb-1.5">
            게시글 주제
          </label>
          <button
            type="button"
            onClick={() => setTopicModalOpen(true)}
            className="w-full flex items-center justify-between h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0"
          >
            <span className={topic ? '' : 'text-gray-40'}>
              {topic || '게시글의 주제를 선택해주세요.'}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-50 flex-shrink-0" />
          </button>
        </div>
        <div>
          <label htmlFor="community-title" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            제목 *
          </label>
          <input
            id="community-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }))
            }}
            placeholder="제목을 입력하세요"
            maxLength={200}
            className={`w-full h-12 px-4 rounded-lg border text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 ${
              fieldErrors.title ? 'border-2 border-error focus:ring-error' : 'border-gray-20 focus:ring-point-0'
            }`}
            required
            aria-invalid={!!fieldErrors.title}
          />
          {fieldErrors.title && (
            <FieldErrorTooltip message={fieldErrors.title} />
          )}
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
          <NoticeBox variant="error">
            {error}
          </NoticeBox>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 rounded-lg bg-point-0 text-white font-semibold text-body-16 disabled:opacity-60"
        >
          {loading ? '처리 중...' : isEdit ? '수정하기' : '등록하기'}
        </button>
      </form>

      {topicModalOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setTopicModalOpen(false)}
            aria-hidden
          />
          <div className="fixed bottom-0 left-0 right-0 z-30 max-w-mobile mx-auto bg-white rounded-t-2xl shadow-lg pb-safe max-h-[85vh] overflow-y-auto">
            <div className="p-2 border-b border-gray-10">
              <div className="w-8 h-1 rounded-full bg-gray-20 mx-auto" aria-hidden />
            </div>
            <div className="p-4">
              <h2 className="text-subhead text-gray-100 mb-4">게시글 주제를 선택해주세요.</h2>
              <div className="space-y-5">
                {COMMUNITY_TOPIC_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="flex items-center gap-1.5 text-body-14 font-medium text-gray-80 mb-2">
                      <span>{group.icon}</span>
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.topics.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTopic(t)
                            setTopicModalOpen(false)
                          }}
                          className={`px-3 py-1.5 rounded-full text-body-14 ${
                            topic === t
                              ? 'bg-point-0 text-white'
                              : 'bg-gray-10 text-gray-100 hover:bg-gray-20'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setTopicModalOpen(false)}
                className="w-full mt-4 py-3 text-body-16 text-gray-60 border border-gray-20 rounded-lg"
              >
                닫기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

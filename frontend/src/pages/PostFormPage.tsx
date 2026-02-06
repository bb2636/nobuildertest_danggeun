import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, X, ImagePlus, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { postsApi, CreatePostBody, PostStatus } from '../api/posts'
import { API_BASE } from '../api/client'
import { uploadApi } from '../api/upload'
import ImageWithFallback from '../components/ImageWithFallback'
import FieldErrorTooltip from '../components/FieldErrorTooltip'
import { getApiErrorMessage } from '../utils/apiError'

const STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: 'SALE', label: '판매중' },
  { value: 'RESERVED', label: '예약중' },
  { value: 'SOLD', label: '판매완료' },
]

const CATEGORY_OPTIONS = [
  { value: '', label: '카테고리 선택' },
  { value: '디지털기기', label: '디지털기기' },
  { value: '가구/인테리어', label: '가구/인테리어' },
  { value: '식물', label: '식물' },
  { value: '생활용품', label: '생활용품' },
  { value: '의류', label: '의류' },
  { value: '기타', label: '기타' },
]

const MAX_IMAGES = 5
const TITLE_MAX_LENGTH = 100
const CONTENT_MAX_LENGTH = 2000
const PRICE_MAX_DIGITS = 12

export default function PostFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isEdit = Boolean(id)
  const postId = id ? parseInt(id, 10) : 0
  const fileInputRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [price, setPrice] = useState<string>('')
  const [status, setStatus] = useState<PostStatus>('SALE')
  const [category, setCategory] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; content?: string; price?: string }>({})
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)

  const { data: postData, isLoading: loading, isError: isLoadError } = useQuery({
    queryKey: ['post', postId, 'edit'],
    queryFn: () => postsApi.getDetail(postId, { forEdit: true }).then((res) => res.data),
    enabled: isEdit && Number.isInteger(postId) && postId >= 1,
  })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!postData) return
    setTitle(postData.title)
    setContent(postData.content ?? '')
    setPrice(
      postData.price != null
        ? String(postData.price).replace(/\D/g, '').slice(0, PRICE_MAX_DIGITS)
        : ''
    )
    setStatus(postData.status)
    setCategory(postData.category ?? '')
    setImageUrls(postData.imageUrls ?? [])
  }, [postData])

  const createMutation = useMutation({
    mutationFn: (body: CreatePostBody) => postsApi.create(body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      navigate(`/posts/${res.data.id}`, { replace: true })
    },
  })
  const updateMutation = useMutation({
    mutationFn: (body: CreatePostBody) => postsApi.update(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      navigate(`/posts/${postId}`, { replace: true })
    },
  })

  const hasContent =
    title.trim() !== '' ||
    content.trim() !== '' ||
    price.trim() !== '' ||
    imageUrls.length > 0 ||
    category !== ''

  const handleBack = () => {
    if (hasContent) {
      setExitConfirmOpen(true)
    } else {
      navigate(-1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    const errs: { title?: string; content?: string; price?: string } = {}
    if (!trimmedTitle) errs.title = '제목을 적어주세요'
    else if (trimmedTitle.length > TITLE_MAX_LENGTH) errs.title = `제목은 ${TITLE_MAX_LENGTH}자 이하여야 합니다.`
    if (!trimmedContent) errs.content = '설명을 적어주세요'
    else if (trimmedContent.length > CONTENT_MAX_LENGTH) errs.content = `설명은 ${CONTENT_MAX_LENGTH}자 이하여야 합니다.`
    const priceStr = price.trim().replace(/\D/g, '')
    if (price.trim() === '') {
      errs.price = '가격을 적어주세요'
    } else if (priceStr.length > PRICE_MAX_DIGITS || Number(priceStr) < 0) {
      errs.price = `가격은 0원 이상, 최대 ${PRICE_MAX_DIGITS}자리까지 입력할 수 있습니다.`
    } else if (Number.isNaN(Number(priceStr))) {
      errs.price = '가격을 적어주세요'
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }
    const priceNum = priceStr.length === 0 ? null : parseInt(priceStr, 10)
    const body: CreatePostBody = {
      title: trimmedTitle.slice(0, TITLE_MAX_LENGTH),
      content: trimmedContent ? trimmedContent.slice(0, CONTENT_MAX_LENGTH) : null,
      price: priceNum == null || Number.isNaN(priceNum) ? null : Math.max(0, priceNum),
      status,
      category: category.trim() || null,
      locationName: user?.locationName ?? null,
      locationCode: user?.locationCode ?? null,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    }
    if (isEdit) {
      updateMutation.mutate(body, {
        onError: (err) => setError(getApiErrorMessage(err, '수정에 실패했습니다.')),
      })
    } else {
      createMutation.mutate(body, {
        onError: (err) => setError(getApiErrorMessage(err, '작성에 실패했습니다.')),
      })
    }
  }

  const inputBase =
    'w-full h-12 px-4 rounded-lg border text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-0 transition-colors'
  const inputNormal = 'border-gray-20 focus:border-2 focus:border-gray-100'
  const inputError = 'border-2 border-error focus:border-error'
  const textareaBase =
    'w-full px-4 py-3 rounded-lg border text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-0 resize-none transition-colors'
  const textareaNormal = 'border-gray-20 focus:border-2 focus:border-gray-100'
  const textareaError = 'border-2 border-error focus:border-error'
  const submitLoading = createMutation.isPending || updateMutation.isPending

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length || imageUrls.length >= MAX_IMAGES) return
    setUploading(true)
    setError('')
    try {
      const toAdd = Math.min(MAX_IMAGES - imageUrls.length, files.length)
      for (let i = 0; i < toAdd; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue
        const { data } = await uploadApi.uploadImage(file)
        const url = data.url.startsWith('http') ? data.url : `${API_BASE}${data.url}`
        setImageUrls((prev) => [...prev, url])
      }
    } catch {
      setError('이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  if (isEdit && (loading || (Number.isInteger(postId) && postId >= 1 && !postData && !isLoadError))) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <p className="text-body-14 text-gray-60">로딩 중...</p>
      </div>
    )
  }
  if (isEdit && isLoadError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <p className="text-body-14 text-error mb-4">게시글을 불러오지 못했습니다.</p>
        <button type="button" onClick={() => navigate(-1)} className="text-point-0 font-semibold text-body-14">
          뒤로
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-light transition-colors"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-5 h-5 text-gray-100" />
        </button>
        <h1 className="text-subhead text-gray-100">
          {isEdit ? '게시글 수정' : '글쓰기'}
        </h1>
      </header>

      {/* 작성 중 나가기 확인 팝업 */}
      {exitConfirmOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-[320px] w-full overflow-hidden">
            <p className="px-6 pt-6 pb-4 text-body-16 text-gray-100 text-center">
              작성 중인 판매 글을 나갈까요?
            </p>
            <div className="flex flex-col border-t border-gray-10">
              <button
                type="button"
                onClick={() => setExitConfirmOpen(false)}
                className="w-full h-12 bg-point-0 text-white text-body-16 font-medium"
              >
                계속 작성하기
              </button>
              <button
                type="button"
                onClick={() => {
                  setExitConfirmOpen(false)
                  navigate(-1)
                }}
                className="w-full h-12 text-body-16 text-gray-70 border-t border-gray-10"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 flex flex-col gap-4" noValidate>
        {/* 이미지: 최상단 */}
        <div>
          <label className="block text-body-14 font-medium text-gray-100 mb-1.5">
            이미지 (최대 {MAX_IMAGES}장)
          </label>
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-20 bg-gray-light"
              >
                <ImageWithFallback
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                  aspectRatio="square"
                  fallbackText=""
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0.5 right-0.5 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="삭제"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {imageUrls.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-20 flex flex-col items-center justify-center text-gray-40 hover:border-point-0 hover:text-point-0 transition-colors disabled:opacity-60"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-body-12 mt-0.5">{uploading ? '업로드 중...' : '추가'}</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
          {user?.locationName && (
            <p className="text-body-12 text-gray-60 mt-2">
              동네: {user.locationName} (로그인 계정 기준)
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="title" className="block text-body-14 font-medium text-gray-100">
              제목 *
            </label>
            <span className="text-body-12 text-gray-50" aria-live="polite">
              {title.length}/{TITLE_MAX_LENGTH}
            </span>
          </div>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              const v = e.target.value
              if (v.length <= TITLE_MAX_LENGTH) setTitle(v)
              if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }))
            }}
            placeholder="글 제목"
            maxLength={TITLE_MAX_LENGTH}
            className={`${inputBase} ${fieldErrors.title ? inputError : inputNormal}`}
            required
            aria-required="true"
            aria-invalid={!!fieldErrors.title}
          />
          {fieldErrors.title && (
            <FieldErrorTooltip message={fieldErrors.title} />
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="content" className="block text-body-14 font-medium text-gray-100">
              자세한 설명 *
            </label>
            <span className="text-body-12 text-gray-50" aria-live="polite">
              {content.length}/{CONTENT_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => {
              const v = e.target.value
              if (v.length <= CONTENT_MAX_LENGTH) setContent(v)
              if (fieldErrors.content) setFieldErrors((prev) => ({ ...prev, content: undefined }))
            }}
            placeholder="게시글 내용을 작성해 주세요."
            rows={5}
            maxLength={CONTENT_MAX_LENGTH}
            className={`${textareaBase} ${fieldErrors.content ? textareaError : textareaNormal}`}
            aria-invalid={!!fieldErrors.content}
          />
          {fieldErrors.content && (
            <FieldErrorTooltip message={fieldErrors.content} />
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="price" className="block text-body-14 font-medium text-gray-100">
              가격 (원) *
            </label>
            <span className="text-body-12 text-gray-50" aria-live="polite">
              {price.replace(/\D/g, '').length}/{PRICE_MAX_DIGITS}
            </span>
          </div>
          <input
            id="price"
            type="text"
            inputMode="numeric"
            value={price}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, PRICE_MAX_DIGITS)
              setPrice(digits === '' ? '' : digits)
              if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: undefined }))
            }}
            placeholder="₩ 가격을 입력해주세요."
            maxLength={PRICE_MAX_DIGITS}
            className={`${inputBase} ${fieldErrors.price ? inputError : inputNormal}`}
            aria-invalid={!!fieldErrors.price}
          />
          {fieldErrors.price && (
            <FieldErrorTooltip message={fieldErrors.price} />
          )}
        </div>
        <div ref={categoryRef} className="relative">
          <label htmlFor="category" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            카테고리
          </label>
          <button
            id="category"
            type="button"
            onClick={() => setCategoryOpen((o) => !o)}
            className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent bg-white flex items-center justify-between text-left"
          >
            <span className={category ? 'text-gray-100' : 'text-gray-40'}>
              {CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? '카테고리 선택'}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-50 flex-shrink-0 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
          </button>
          {categoryOpen && (
            <ul className="absolute z-20 left-0 right-0 mt-1 py-1 bg-white border border-gray-20 rounded-lg shadow-lg overflow-y-auto max-h-[200px]">
              {CATEGORY_OPTIONS.map((opt) => (
                <li key={opt.value || 'none'}>
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-body-14 text-gray-100 hover:bg-grey-50 focus:bg-grey-50 focus:outline-none"
                    onClick={() => {
                      setCategory(opt.value)
                      setCategoryOpen(false)
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {isEdit && (
          <div>
            <label className="block text-body-14 font-medium text-gray-100 mb-1.5">
              상태
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value)}
                    className="w-4 h-4 text-point-0 border-gray-20"
                  />
                  <span className="text-body-14 text-gray-100">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {error && (
          <FieldErrorTooltip message={error} />
        )}
        <button
          type="submit"
          disabled={submitLoading || Object.keys(fieldErrors).length > 0}
          className="w-full h-12 mt-2 rounded-lg bg-point-0 text-white font-semibold text-body-16 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-point-0/90 transition-colors"
        >
          {submitLoading ? '처리 중...' : isEdit ? '수정하기' : '작성 완료'}
        </button>
      </form>
    </div>
  )
}

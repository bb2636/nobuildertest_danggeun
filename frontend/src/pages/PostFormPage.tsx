import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, X, ImagePlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { postsApi, CreatePostBody, PostStatus } from '../api/posts'
import { uploadApi } from '../api/upload'
import ImageWithFallback from '../components/ImageWithFallback'
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

  const { data: postData, isLoading: loading, isError: isLoadError } = useQuery({
    queryKey: ['post', postId, 'edit'],
    queryFn: () => postsApi.getDetail(postId, { forEdit: true }).then((res) => res.data),
    enabled: isEdit && Number.isInteger(postId) && postId >= 1,
  })

  useEffect(() => {
    if (!postData) return
    setTitle(postData.title)
    setContent(postData.content ?? '')
    setPrice(postData.price != null ? String(postData.price) : '')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('제목을 입력해주세요.')
      return
    }
    const body: CreatePostBody = {
      title: trimmedTitle,
      content: content.trim() || null,
      price: price === '' ? null : parseInt(price, 10) || null,
      status,
      category: category.trim() || null,
      locationName: user?.locationName ?? null,
      locationCode: user?.locationCode ?? null,
      imageUrls: imageUrls.length > 0 ? imageUrls : null,
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
        const url = data.url.startsWith('http') ? data.url : `${import.meta.env.VITE_API_URL ?? ''}${data.url}`
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
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-light transition-colors"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-5 h-5 text-gray-100" />
        </button>
        <h1 className="text-subhead text-gray-100">
          {isEdit ? '게시글 수정' : '글쓰기'}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 flex flex-col gap-4">
        <div>
          <label htmlFor="title" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            제목 *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="글 제목"
            maxLength={100}
            className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent"
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="자세한 내용을 입력해주세요"
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent resize-none"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            가격 (원)
          </label>
          <input
            id="price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0 또는 비우면 무료나눔"
            className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-body-14 font-medium text-gray-100 mb-1.5">
            카테고리
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent bg-white"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value || 'none'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
        {error && (
          <p className="text-body-14 text-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitLoading}
          className="w-full h-12 mt-2 rounded-lg bg-point-0 text-white font-semibold text-body-16 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-point-0/90 transition-colors"
        >
          {submitLoading ? '처리 중...' : isEdit ? '수정하기' : '등록하기'}
        </button>
      </form>
    </div>
  )
}

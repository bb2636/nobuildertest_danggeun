import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { locationsApi, type LocationItem } from '../api/locations'
import { uploadApi } from '../api/upload'
import ImageWithFallback from '../components/ImageWithFallback'
import { getApiErrorMessage } from '../utils/apiError'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [nickname, setNickname] = useState('')
  const [locationCode, setLocationCode] = useState('')
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setNickname(user.nickname)
      setLocationCode(user.locationCode ?? '')
    }
  }, [user])

  useEffect(() => {
    locationsApi.getList().then((res) => setLocations(res.data.locations ?? [])).catch(() => {})
  }, [])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setError('')
    setAvatarUploading(true)
    try {
      const { data } = await uploadApi.uploadImage(file)
      const url = data.url.startsWith('http') ? data.url : `${API_BASE}${data.url}`
      await updateProfile({ profileImageUrl: url })
    } catch {
      setError('프로필 사진 업로드에 실패했습니다.')
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const selected = locations.find((l) => l.code === locationCode)
      await updateProfile({
        nickname: nickname.trim(),
        locationName: selected?.name ?? null,
        locationCode: locationCode || null,
      })
      navigate(-1)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, '저장에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

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
        <h1 className="text-subhead text-gray-100">프로필 수정</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-6 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-20 bg-gray-light flex items-center justify-center group disabled:opacity-60"
          >
            <ImageWithFallback
              src={user.profileImageUrl}
              alt="프로필"
              className="w-full h-full object-cover"
              aspectRatio="square"
              fallbackText=""
            />
            <span className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <span className="text-body-12 text-gray-50">
            {avatarUploading ? '업로드 중...' : '사진을 눌러 프로필 이미지를 변경하세요'}
          </span>
        </div>
        <div>
          <label htmlFor="profile-email" className="block text-body-14 font-medium text-gray-60 mb-1.5">
            이메일
          </label>
          <input
            id="profile-email"
            type="text"
            value={user.email}
            disabled
            className="w-full h-12 px-4 rounded-lg border border-gray-10 text-body-16 text-gray-50 bg-gray-light"
          />
        </div>
        <div>
          <label htmlFor="profile-nickname" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            닉네임
          </label>
          <input
            id="profile-nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            maxLength={50}
            className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="profile-location" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            동네
          </label>
          <select
            id="profile-location"
            value={locationCode}
            onChange={(e) => setLocationCode(e.target.value)}
            className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent bg-white"
          >
            <option value="">동네를 선택하세요</option>
            {locations.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-body-14 text-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 rounded-lg bg-point-0 text-white font-semibold text-body-16 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-point-0/90 transition-colors"
        >
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </form>
    </div>
  )
}

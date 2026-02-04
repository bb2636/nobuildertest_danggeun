import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { locationsApi, type LocationItem } from '../api/locations'
import { getApiErrorMessage } from '../utils/apiError'
import LocationSelect from '../components/LocationSelect'

export default function SetLocationPage() {
  const [locationCode, setLocationCode] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { updateProfile } = useAuth()
  const navigate = useNavigate()

  const hasSelection = Boolean(locationCode && locationName)

  useEffect(() => {
    locationsApi.getList().then((res) => setLocations(res.data.locations ?? [])).catch(() => {})
  }, [])

  const handleConfirm = async () => {
    if (!hasSelection) return
    setError('')
    setLoading(true)
    try {
      await updateProfile({ locationName, locationCode })
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, '동네 설정에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-light"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-gray-100" />
        </button>
        <h1 className="text-subhead text-gray-100">내 동네 설정</h1>
        <div className="w-9" />
      </header>

      <main className="flex-1 px-6 pt-8">
        <p className="text-body-14 text-gray-60 mb-6">
          로그인 이력이 처음이거나 동네 설정 값이 없을 때 표시됩니다.
        </p>
        <div className="mb-8">
          <LocationSelect
            id="set-location"
            label="동네 선택"
            value={locationCode}
            onChange={(code, name) => {
              setLocationCode(code)
              setLocationName(name)
            }}
            options={locations}
            placeholder="동네를 선택하세요"
            listMaxHeight="200px"
          />
        </div>
        {error && (
          <p className="text-body-14 text-error mb-4" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={!hasSelection || loading}
          onClick={handleConfirm}
          className={`w-full h-12 rounded-lg font-semibold text-body-16 transition-colors ${
            hasSelection
              ? 'bg-point-0 text-white hover:bg-point-0/90 disabled:opacity-60'
              : 'bg-gray-20 text-gray-50 cursor-not-allowed'
          }`}
        >
          {loading ? '저장 중...' : '확인'}
        </button>
      </main>
    </div>
  )
}

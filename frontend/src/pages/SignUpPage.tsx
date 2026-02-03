import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Carrot } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { locationsApi, type LocationItem } from '../api/locations'
import { getApiErrorMessage } from '../utils/apiError'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [locationCode, setLocationCode] = useState('')
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    locationsApi.getList().then((res) => setLocations(res.data.locations ?? [])).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const selected = locations.find((l) => l.code === locationCode)
      await signUp({
        email,
        password,
        nickname,
        locationName: selected?.name ?? undefined,
        locationCode: locationCode || undefined,
      })
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, '회원가입에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white px-6 pt-12 pb-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-full bg-point-0 flex items-center justify-center mb-3">
          <Carrot className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-title-3 text-gray-100">회원가입</h1>
        <p className="text-body-14 text-gray-60 mt-1">당근마켓 클론에 오신 것을 환영해요</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent"
            required
            aria-required="true"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상"
            className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent"
            required
            aria-required="true"
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="nickname" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent"
            required
            aria-required="true"
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            동네 (선택)
          </label>
          <select
            id="location"
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
          {loading ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <p className="mt-8 text-center text-body-14 text-gray-60">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-point-0 font-semibold">
          로그인
        </Link>
      </p>
    </div>
  )
}

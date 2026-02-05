import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Carrot } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import NoticeBox from '../components/NoticeBox'
import { getApiErrorMessage } from '../utils/apiError'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = (await login(email, password)) as {
        user?: { locationName?: string | null; locationCode?: string | null }
      }
      const hasLocation = Boolean(data?.user?.locationName || data?.user?.locationCode)
      navigate(hasLocation ? '/' : '/set-location', { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, '로그인에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white px-6 pt-16 pb-8">
      <div className="flex flex-col items-center mb-10">
        <div className="w-14 h-14 rounded-full bg-point-0 flex items-center justify-center mb-4">
          <Carrot className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-display-1 font-bold text-gray-100">당근마켓 클론</h1>
        <p className="text-body-14 text-gray-60 mt-2">이메일로 로그인하세요</p>
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
            placeholder="비밀번호 입력"
            className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent"
            required
            aria-required="true"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <NoticeBox variant="error">
            {error}
          </NoticeBox>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 rounded-lg bg-point-0 text-white font-semibold text-body-16 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-point-0/90 transition-colors"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="mt-8 text-center text-body-14 text-gray-60">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="text-point-0 font-semibold">
          회원가입
        </Link>
      </p>
    </div>
  )
}

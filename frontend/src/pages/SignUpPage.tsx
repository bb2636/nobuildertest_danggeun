import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Carrot } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import NoticeBox from '../components/NoticeBox'
import { getApiErrorMessage } from '../utils/apiError'

type FieldError = { email?: string; password?: string; passwordConfirm?: string; nickname?: string }

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const validate = (): boolean => {
    const err: FieldError = {}
    if (!email.trim()) err.email = '이메일을 입력해주세요'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) err.email = '올바른 이메일 형식으로 입력해주세요'
    if (!password) err.password = '비밀번호를 입력해주세요'
    else if (password.length < 8) err.password = '비밀번호는 8자리 이상으로 입력해주세요'
    if (!passwordConfirm) err.passwordConfirm = '비밀번호를 입력해주세요'
    else if (password !== passwordConfirm) err.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    if (!nickname.trim()) err.nickname = '닉네임을 입력해주세요'
    setFieldErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setSubmitError('')
    if (!validate()) return
    setLoading(true)
    try {
      await signUp({
        email: email.trim(),
        password,
        nickname: nickname.trim(),
      })
      navigate('/set-location', { replace: true })
    } catch (err: unknown) {
      setSubmitError(getApiErrorMessage(err, '회원가입에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent'
  const errorBorder = 'border-error focus:ring-error'

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
            placeholder="이메일을 입력해주세요"
            className={`${inputClass} ${fieldErrors.email ? errorBorder : ''}`}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            autoComplete="email"
          />
          {fieldErrors.email && (
            <NoticeBox id="email-error" variant="error" className="mt-1">
              {fieldErrors.email}
            </NoticeBox>
          )}
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
            placeholder="비밀번호를 입력해주세요"
            className={`${inputClass} ${fieldErrors.password ? errorBorder : ''}`}
            aria-invalid={!!fieldErrors.password}
            autoComplete="new-password"
          />
          {fieldErrors.password && (
            <NoticeBox variant="error" className="mt-1">
              {fieldErrors.password}
            </NoticeBox>
          )}
        </div>
        <div>
          <label htmlFor="passwordConfirm" className="block text-body-14 font-medium text-gray-100 mb-1.5">
            비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호를 다시 입력해주세요"
            className={`${inputClass} ${fieldErrors.passwordConfirm ? errorBorder : ''}`}
            aria-invalid={!!fieldErrors.passwordConfirm}
            autoComplete="new-password"
          />
          {fieldErrors.passwordConfirm && (
            <NoticeBox variant="error" className="mt-1">
              {fieldErrors.passwordConfirm}
            </NoticeBox>
          )}
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
            placeholder="닉네임을 입력해주세요"
            className={`${inputClass} ${fieldErrors.nickname ? errorBorder : ''}`}
            aria-invalid={!!fieldErrors.nickname}
            autoComplete="username"
          />
          {fieldErrors.nickname && (
            <NoticeBox variant="error" className="mt-1">
              {fieldErrors.nickname}
            </NoticeBox>
          )}
        </div>
        {submitError && (
          <NoticeBox variant="error">
            {submitError}
          </NoticeBox>
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

import type { ApiErrorResponse } from '../types/api'

type AxiosLike = {
  response?: { data?: unknown; status?: number }
  request?: unknown
  code?: string
  message?: string
}

/** API 에러에서 사용자용 메시지 + 디버깅용 요약 (모바일에서 콘솔 없을 때 활용) */
export function getApiErrorMessage(
  err: unknown,
  fallback: string = '오류가 발생했습니다.'
): string {
  const ax = err as AxiosLike
  const data = ax?.response?.data
  const status = ax?.response?.status

  // 서버가 보낸 message가 있으면 그대로 사용
  if (data && typeof data === 'object' && 'message' in data && typeof (data as ApiErrorResponse).message === 'string') {
    const msg = (data as ApiErrorResponse).message.trim()
    if (msg) return msg
  }

  // 네트워크 오류 (응답 없음 또는 status 0: 연결 실패, CORS, 잘못된 주소 등)
  const isNetworkError =
    !ax?.response ||
    status === 0 ||
    ax?.code === 'ERR_NETWORK' ||
    ax?.message?.includes('Network Error') ||
    ax?.message?.includes('Failed to fetch')
  if (isNetworkError) {
    return '서버에 연결할 수 없습니다. 같은 Wi‑Fi인지, 백엔드 실행·노트북 IP(예: 172.30.1.71:3001) 확인해주세요.'
  }

  if (ax?.code === 'ECONNABORTED') {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.'
  }

  // HTTP 상태만 있는 경우 (모바일에서 원인 파악용으로 상태 코드 포함)
  if (typeof status === 'number') {
    if (status === 400) return `${fallback} (입력값 확인)`
    if (status === 401) return '이메일 또는 비밀번호가 맞지 않습니다.'
    if (status === 404) return `${fallback} (404)`
    if (status >= 500) return `${fallback} (서버 오류 ${status})`
    return `${fallback} (${status})`
  }

  return fallback
}

/** 모바일 디버깅용: 에러 요약 한 줄 (상태코드/코드) */
export function getApiErrorDetail(err: unknown): string | null {
  const ax = err as AxiosLike
  if (ax?.response?.status != null) return `상태 ${ax.response.status}`
  if (ax?.code) return `코드 ${ax.code}`
  if (ax?.message && typeof ax.message === 'string') return ax.message.slice(0, 60)
  return null
}

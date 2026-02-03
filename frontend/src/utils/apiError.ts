import type { ApiErrorResponse } from '../types/api'

/** API 에러에서 message 추출 (response.data는 ApiErrorResponse 형태) */
export function getApiErrorMessage(
  err: unknown,
  fallback: string = '오류가 발생했습니다.'
): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  if (data && typeof data === 'object' && 'message' in data && typeof (data as ApiErrorResponse).message === 'string') {
    const msg = (data as ApiErrorResponse).message.trim()
    return msg || fallback
  }
  return fallback
}

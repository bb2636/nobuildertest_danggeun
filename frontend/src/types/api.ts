/** API 에러 응답 공통 타입 (백엔드 message 필드 통일) */
export interface ApiErrorResponse {
  message: string
  code?: number
  errors?: unknown
}

/** Axios 에러에서 ApiErrorResponse 추출 */
export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as ApiErrorResponse).message === 'string'
  )
}

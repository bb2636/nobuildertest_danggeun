const API_BASE = import.meta.env.VITE_API_URL ?? ''

/**
 * 상대 경로 이미지 URL을 API 기준 절대 URL로 변환 (채팅방·목록 등에서 사용)
 */
export function toAbsoluteImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

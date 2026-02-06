import { API_BASE } from '../api/client'

/**
 * 이미지 URL을 현재 환경에서 로드 가능한 절대 URL로 변환.
 * - 상대 경로(/uploads/...) → API_BASE 붙임
 * - DB에 localhost/127.0.0.1로 저장된 기존 URL → API_BASE로 치환 (모바일에서 이미지 로드용)
 */
export function toAbsoluteImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null
  // 절대 URL인데 호스트가 localhost/127.0.0.1 → API_BASE로 치환 (포트 상관없이)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const u = new URL(trimmed)
      const host = u.hostname.toLowerCase()
      if (host === 'localhost' || host === '127.0.0.1') {
        return `${API_BASE}${u.pathname}${u.search}`
      }
      return trimmed
    } catch {
      return trimmed
    }
  }
  // 상대 경로
  return `${API_BASE}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`
}

/**
 * 가격 포맷 (무료나눔 / 1,000원)
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '무료나눔'
  return `${price.toLocaleString()}원`
}

/**
 * 채팅/목록용 상대 시간 (방금 전, n분 전, 어제, n일 전 등)
 */
export function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 10) return '방금 전'
  if (diffSec < 60) return `${diffSec}초 전`
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay === 1) return '어제'
  if (diffDay < 7) return `${diffDay}일 전`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

/**
 * 채팅 메시지 시간 표시: 오늘은 시:분, 어제는 어제 시:분, 그 이전은 월/일 시:분
 */
export function formatMessageTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  const timeStr = date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  if (isToday) return timeStr
  if (isYesterday) return `어제 ${timeStr}`
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + ' ' + timeStr
}

import { type ReactNode } from 'react'

/** 1번 이미지 스타일: 연한 오렌지/베이지 배경의 둥근 안내·예외 메시지 박스 */
interface NoticeBoxProps {
  /** 박스 상단에 볼드로 표시할 라벨 (예: "안내") */
  title?: string
  /** 메시지 내용 */
  children: ReactNode
  /** info: 연한 오렌지 배경, error: 연한 빨강 배경 */
  variant?: 'info' | 'error'
  className?: string
  id?: string
}

export default function NoticeBox({ title, children, variant = 'info', className = '', id }: NoticeBoxProps) {
  const bgClass = variant === 'error' ? 'bg-error-2' : 'bg-notice'
  return (
    <div
      id={id}
      className={`rounded-lg px-4 py-3 text-body-14 text-gray-100 ${bgClass} ${className}`}
      role={variant === 'error' ? 'alert' : undefined}
    >
      {title && <span className="font-semibold">{title} </span>}
      {children}
    </div>
  )
}

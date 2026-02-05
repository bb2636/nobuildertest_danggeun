/** 필드 오류: 주황 아이콘 + 당근 UI 색(주황) 텍스트만 표시, 박스 없음 */
interface FieldErrorTooltipProps {
  message: string
  className?: string
  id?: string
}

export default function FieldErrorTooltip({ message, className = '', id }: FieldErrorTooltipProps) {
  return (
    <p
      id={id}
      className={`mt-1.5 flex items-center gap-1.5 text-body-12 text-point-0 ${className}`}
      role="alert"
    >
      <span className="w-5 h-5 rounded-full bg-point-0 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold leading-none">!</span>
      </span>
      {message}
    </p>
  )
}

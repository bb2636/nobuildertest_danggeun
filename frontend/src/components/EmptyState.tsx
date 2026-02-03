import { type LucideIcon, Inbox } from 'lucide-react'

interface EmptyStateProps {
  /** 기본: Inbox. 빈 상태용 아이콘 */
  icon?: LucideIcon
  title: string
  description?: string
  /** 버튼 등 액션 (선택) */
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      role="status"
    >
      <div className="w-16 h-16 rounded-full bg-gray-10 flex items-center justify-center text-gray-40 mb-4">
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <p className="text-body-16 font-medium text-gray-80">{title}</p>
      {description && (
        <p className="text-body-14 text-gray-50 mt-1 max-w-[240px]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

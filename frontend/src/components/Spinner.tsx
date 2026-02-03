interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

export default function Spinner({ className = '', size = 'md' }: SpinnerProps) {
  return (
    <div
      className={`rounded-full border-gray-20 border-t-point-0 animate-spin ${sizeClass[size]} ${className}`}
      role="status"
      aria-label="로딩 중"
    />
  )
}

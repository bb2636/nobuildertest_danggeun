import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string | null
  alt?: string
  className?: string
  /** 갤러리 등 정사각/고정 비율일 때 사용 */
  aspectRatio?: 'square' | 'video' | 'auto'
  /** 실패 시 표시할 텍스트 */
  fallbackText?: string
}

export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  aspectRatio = 'auto',
  fallbackText = '이미지 없음',
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
        ? 'aspect-video'
        : ''

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-light text-gray-40 text-body-14 ${aspectClass} ${className}`}
      >
        <span>{fallbackText}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${aspectClass} ${className}`}
      onError={() => setError(true)}
    />
  )
}

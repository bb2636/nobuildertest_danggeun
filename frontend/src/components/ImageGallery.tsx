import { useRef, useState, useEffect } from 'react'
import ImageWithFallback from './ImageWithFallback'

interface ImageGalleryProps {
  urls: string[]
  /** 이미지 없을 때 높이 (aspect-square + max-h 사용) */
  className?: string
}

export default function ImageGallery({ urls, className = '' }: ImageGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const index = Math.round(el.scrollLeft / el.clientWidth)
      setCurrentIndex(Math.min(index, urls.length - 1))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [urls.length])

  if (!urls.length) {
    return (
      <div
        className={`w-full aspect-square max-h-[430px] flex items-center justify-center bg-gray-light text-gray-40 text-body-14 ${className}`}
      >
        이미지 없음
      </div>
    )
  }

  return (
    <div className={`relative w-full aspect-square max-h-[430px] bg-gray-light overflow-hidden ${className}`}>
      <div
        ref={scrollRef}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {urls.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="flex-shrink-0 w-full h-full snap-center flex items-center justify-center"
          >
            <ImageWithFallback
              src={url}
              alt=""
              className="w-full h-full object-contain"
              fallbackText="이미지를 불러올 수 없어요"
            />
          </div>
        ))}
      </div>
      {urls.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {urls.map((_, i) => (
            <span
              key={i}
              className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentIndex ? 'bg-white ring-2 ring-gray-40' : 'bg-white/60'
              }`}
              aria-hidden
            />
          ))}
        </div>
      )}
    </div>
  )
}

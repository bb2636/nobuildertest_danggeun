import { useState, useEffect } from 'react'
import { API_BASE } from '../api/client'
import { toAbsoluteImageUrl } from '../utils/image'

interface ImageWithFallbackProps {
  src: string | null
  alt?: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'auto'
  fallbackText?: string
}

/**
 * 우리 백엔드(API_BASE) 이미지는 fetch → blob → object URL 로 표시 (Capacitor WebView img 차단 우회)
 */
function useDisplayUrl(resolvedSrc: string | null): { url: string | null; loading: boolean } {
  const [state, setState] = useState<{ url: string | null; loading: boolean }>({
    url: null,
    loading: false,
  })

  useEffect(() => {
    if (!resolvedSrc) {
      setState({ url: null, loading: false })
      return
    }
    const isOurApi = Boolean(API_BASE && resolvedSrc.startsWith(API_BASE))
    if (!isOurApi) {
      setState({ url: resolvedSrc, loading: false })
      return
    }
    setState({ url: null, loading: true })
    let blobUrl: string | null = null
    fetch(resolvedSrc, {
      mode: 'cors',
      credentials: 'omit',
      headers: { Accept: 'image/*' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.blob()
      })
      .then((blob) => {
        blobUrl = URL.createObjectURL(blob)
        setState({ url: blobUrl, loading: false })
      })
      .catch(() => {
        setState({ url: null, loading: false })
      })
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [resolvedSrc])

  return state
}

export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  aspectRatio = 'auto',
  fallbackText = '이미지 없음',
}: ImageWithFallbackProps) {
  const [imgError, setImgError] = useState(false)
  const resolvedSrc = toAbsoluteImageUrl(src)
  const { url: displayUrl, loading } = useDisplayUrl(resolvedSrc)

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
        ? 'aspect-video'
        : ''

  if (!resolvedSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-light text-gray-40 text-body-14 ${aspectClass} ${className}`}
      >
        <span>{fallbackText}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-light text-gray-40 text-body-14 ${aspectClass} ${className}`}
      >
        <span>…</span>
      </div>
    )
  }

  const finalUrl = displayUrl || resolvedSrc
  if (!finalUrl || imgError) {
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
      src={finalUrl}
      alt={alt}
      className={`${aspectClass} ${className}`}
      onError={() => setImgError(true)}
    />
  )
}

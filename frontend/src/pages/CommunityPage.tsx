import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Plus, MapPin } from 'lucide-react'
import { locationsApi, type LocationItem } from '../api/locations'
import { communityApi, type CommunityPostListItem } from '../api/community'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { formatRelativeTime } from '../utils/format'

const PAGE_SIZE = 20

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPostListItem[]>([])
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [locationCode, setLocationCode] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    locationsApi.getList().then((res) => setLocations(res.data.locations ?? [])).catch(() => {})
  }, [])

  const fetchList = useCallback(() => {
    setError('')
    setLoading(true)
    communityApi
      .getList({
        page: 1,
        limit: PAGE_SIZE,
        locationCode: locationCode || undefined,
      })
      .then((res) => {
        setPosts(res.data.posts ?? [])
        setPage(1)
        setTotalPages(res.data.totalPages ?? 1)
      })
      .catch(() => setError('동네생활 글을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [locationCode])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return
    setLoadingMore(true)
    const nextPage = page + 1
    communityApi
      .getList({
        page: nextPage,
        limit: PAGE_SIZE,
        locationCode: locationCode || undefined,
      })
      .then((res) => {
        setPosts((prev) => [...prev, ...(res.data.posts ?? [])])
        setPage(nextPage)
        setTotalPages(res.data.totalPages ?? 1)
      })
      .finally(() => setLoadingMore(false))
  }, [page, totalPages, loadingMore, locationCode])

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '100px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="min-h-screen bg-grey-50 flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-subhead text-gray-100">동네생활</h1>
        <Link
          to="/community/new"
          className="p-2 rounded-full bg-point-0 text-white hover:bg-point-0/90"
          aria-label="글쓰기"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </header>
      <main className="flex-1 px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <select
            value={locationCode}
            onChange={(e) => setLocationCode(e.target.value)}
            className="text-body-14 text-gray-100 border border-gray-20 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-point-0"
          >
            <option value="">전체 동네</option>
            {locations.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
        {loading && (
          <div className="py-12 flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <span className="text-body-14 text-gray-60">로딩 중...</span>
          </div>
        )}
        {error && (
          <div className="py-8 px-4 text-center">
            <p className="text-body-14 text-error mb-3">{error}</p>
            <button
              type="button"
              onClick={fetchList}
              className="px-4 py-2 rounded-lg bg-point-0 text-white text-body-14 font-medium"
            >
              다시 시도
            </button>
          </div>
        )}
        {!loading && !error && posts.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title="아직 동네생활 글이 없어요"
            description="첫 글을 올려보세요."
            action={
              <Link
                to="/community/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-point-0 text-white text-body-14 font-medium"
              >
                <Plus className="w-4 h-4" />
                글쓰기
              </Link>
            }
          />
        )}
        {!loading && posts.length > 0 && (
          <>
            <ul className="space-y-0 divide-y divide-gray-10 bg-white rounded-xl overflow-hidden border border-gray-10">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/community/${post.id}`}
                    className="block p-4 hover:bg-grey-50 transition-colors"
                  >
                    <h3 className="text-body-16 font-medium text-gray-100 line-clamp-2">
                      {post.title}
                    </h3>
                    {post.content && (
                      <p className="text-body-14 text-gray-60 mt-0.5 line-clamp-2">
                        {post.content}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-body-12 text-gray-50">
                      {post.locationName && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {post.locationName}
                        </span>
                      )}
                      <span>{post.userNickname}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(post.createdAt)}</span>
                      <span className="flex items-center gap-0.5 ml-auto">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.commentCount}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div ref={loadMoreRef} className="py-4 flex justify-center items-center gap-2">
              {loadingMore && (
                <>
                  <Spinner size="sm" />
                  <span className="text-body-14 text-gray-60">더 불러오는 중...</span>
                </>
              )}
              {!loadingMore && page >= totalPages && posts.length > 0 && (
                <span className="text-body-12 text-gray-40">마지막 글입니다</span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

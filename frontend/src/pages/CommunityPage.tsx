import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MessageSquare, MapPin, Plus, ChevronRight, Flame, Eye } from 'lucide-react'
import { locationsApi, type LocationItem } from '../api/locations'
import { communityApi, type CommunityPostListItem } from '../api/community'
import { COMMUNITY_TOPIC_FILTER_OPTIONS } from '../constants/community'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import NoticeBox from '../components/NoticeBox'
import { formatRelativeTime } from '../utils/format'

const PAGE_SIZE = 20
const RECOMMEND_FEED_LIMIT = 3

export default function CommunityPage() {
  const queryClient = useQueryClient()
  const [posts, setPosts] = useState<CommunityPostListItem[]>([])
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [locationCode, setLocationCode] = useState('')
  const [topic, setTopic] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [popularPosts, setPopularPosts] = useState<CommunityPostListItem[]>([])
  const [popularLoading, setPopularLoading] = useState(false)

  useEffect(() => {
    communityApi.markNotificationsRead().then(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] })
    }).catch(() => {})
  }, [queryClient])

  useEffect(() => {
    locationsApi.getList().then((res) => setLocations(res.data.locations ?? [])).catch(() => {})
  }, [])

  const fetchList = useCallback(() => {
    setError('')
    setLoading(true)
    const isPopular = topic === 'popular'
    const isRecommend = topic === ''
    const limit = isRecommend ? RECOMMEND_FEED_LIMIT : PAGE_SIZE
    communityApi
      .getList({
        page: 1,
        limit,
        locationCode: locationCode || undefined,
        topic: isPopular ? undefined : (topic || undefined),
        sort: isPopular ? 'popular' : 'latest',
      })
      .then((res) => {
        setPosts(res.data.posts ?? [])
        setPage(1)
        setTotalPages(res.data.totalPages ?? 1)
      })
      .catch(() => setError('동네생활 글을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [locationCode, topic])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    if (topic !== '') return
    setPopularLoading(true)
    communityApi
      .getList({
        page: 1,
        limit: 10,
        locationCode: locationCode || undefined,
        sort: 'popular',
      })
      .then((res) => setPopularPosts(res.data.posts ?? []))
      .catch(() => setPopularPosts([]))
      .finally(() => setPopularLoading(false))
  }, [topic, locationCode])

  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return
    setLoadingMore(true)
    const nextPage = page + 1
    const isPopular = topic === 'popular'
    communityApi
      .getList({
        page: nextPage,
        limit: PAGE_SIZE,
        locationCode: locationCode || undefined,
        topic: isPopular ? undefined : (topic || undefined),
        sort: isPopular ? 'popular' : 'latest',
      })
      .then((res) => {
        setPosts((prev) => [...prev, ...(res.data.posts ?? [])])
        setPage(nextPage)
        setTotalPages(res.data.totalPages ?? 1)
      })
      .finally(() => setLoadingMore(false))
  }, [page, totalPages, loadingMore, locationCode, topic])

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
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3">
        <h1 className="text-subhead text-gray-100">동네생활</h1>
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
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          {COMMUNITY_TOPIC_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value || 'all'}
              type="button"
              onClick={() => setTopic(opt.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-body-14 font-medium transition-colors ${
                topic === opt.value
                  ? 'bg-point-0 text-white'
                  : 'bg-white border border-gray-20 text-gray-70 hover:bg-grey-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {loading && (
          <div className="py-12 flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <span className="text-body-14 text-gray-60">로딩 중...</span>
          </div>
        )}
        {error && (
          <div className="py-8 px-4 text-center">
            <NoticeBox variant="error" className="mb-3">
              {error}
            </NoticeBox>
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
              {(topic === '' ? posts.slice(0, RECOMMEND_FEED_LIMIT) : posts).map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/community/${post.id}`}
                    className="block p-4 hover:bg-grey-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.topic && (
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-10 text-body-12 text-gray-70">
                          {post.topic}
                        </span>
                      )}
                      <h3 className="text-body-16 font-medium text-gray-100 line-clamp-2 flex-1 min-w-0">
                        {post.title}
                      </h3>
                    </div>
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
                      <span className="flex items-center gap-1.5 ml-auto">
                        <span className="flex items-center gap-0.5 text-gray-50">
                          <Eye className="w-3.5 h-3.5" />
                          {post.viewCount ?? 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.commentCount}
                        </span>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {topic !== '' && (
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
            )}
          </>
        )}
        {topic === '' && (
          <section className="mt-4 pt-4 border-t border-gray-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-body-16 font-semibold text-gray-100 flex items-center gap-1">
                <Flame className="w-4 h-4 text-point-0" />
                지금 인기 소식
              </h2>
              <button
                type="button"
                onClick={() => setTopic('popular')}
                className="text-body-14 text-gray-60 flex items-center gap-0.5 p-1 -m-1 rounded hover:bg-grey-50"
                aria-label="인기 탭으로 이동"
              >
                <span>더보기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {popularLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-40 h-28 rounded-xl bg-gray-10 animate-pulse"
                    aria-hidden
                  />
                ))}
              </div>
            ) : popularPosts.length > 0 ? (
              <div
                className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4"
                style={{ scrollbarWidth: 'none' }}
              >
                {popularPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/community/${post.id}`}
                    className="flex-shrink-0 w-40 p-3 rounded-xl bg-white border border-gray-10 hover:border-point-0/30 transition-colors block text-left"
                  >
                    {post.locationName && (
                      <p className="text-body-12 text-gray-50 mb-1">{post.locationName}</p>
                    )}
                    <p className="text-body-14 text-gray-100 line-clamp-2 font-medium">
                      {post.title}
                    </p>
                    {post.content && (
                      <p className="text-body-12 text-gray-60 line-clamp-2 mt-0.5">
                        {post.content}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1.5 text-body-12 text-gray-50">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.commentCount}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        )}
      </main>
    </div>
  )
}

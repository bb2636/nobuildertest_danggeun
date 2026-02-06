import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient, useQuery, useInfiniteQuery } from '@tanstack/react-query'
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

/** 동네생활 목록 캐시 유효 시간: 이 시간 동안은 탭 전환 시 캐시만 보여 주고 재요청하지 않음. 이후 백그라운드에서 갱신 */
const COMMUNITY_LIST_STALE_MS = 2 * 60 * 1000

export default function CommunityPage() {
  const queryClient = useQueryClient()
  const [locationCode, setLocationCode] = useState('')
  const [topic, setTopic] = useState('')
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await locationsApi.getList()
      return res.data.locations ?? []
    },
  })
  const locations: LocationItem[] = locationsData ?? []

  useEffect(() => {
    communityApi.markNotificationsRead().then(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] })
    }).catch(() => {})
  }, [queryClient])

  const isPopular = topic === 'popular'
  const isRecommend = topic === ''
  const listLimit = isRecommend ? RECOMMEND_FEED_LIMIT : PAGE_SIZE

  const {
    data: listData,
    isLoading: loading,
    isError: isListError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage: loadingMore,
  } = useInfiniteQuery({
    queryKey: ['community', 'list', locationCode, topic],
    queryFn: async ({ pageParam }) => {
      const res = await communityApi.getList({
        page: pageParam,
        limit: listLimit,
        locationCode: locationCode || undefined,
        topic: isPopular ? undefined : (topic || undefined),
        sort: isPopular ? 'popular' : 'latest',
      })
      return res.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: COMMUNITY_LIST_STALE_MS,
    refetchOnWindowFocus: false,
  })

  const rawPosts: CommunityPostListItem[] = listData?.pages.flatMap((p) => p.posts) ?? []
  const posts = useMemo(() => {
    const map = new Map<number, CommunityPostListItem>()
    for (const p of rawPosts) map.set(p.id, p)
    return Array.from(map.values())
  }, [rawPosts])
  const error = isListError ? '동네생활 글을 불러오지 못했습니다.' : ''

  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['community', 'popular-strip', locationCode],
    queryFn: async () => {
      const res = await communityApi.getList({
        page: 1,
        limit: 10,
        locationCode: locationCode || undefined,
        sort: 'popular',
      })
      return res.data.posts ?? []
    },
    enabled: isRecommend,
    staleTime: COMMUNITY_LIST_STALE_MS,
    refetchOnWindowFocus: false,
  })
  const popularPosts: CommunityPostListItem[] = popularData ?? []

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el || !hasNextPage || loadingMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage()
      },
      { rootMargin: '100px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, loadingMore])

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
              onClick={() => queryClient.invalidateQueries({ queryKey: ['community', 'list'] })}
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
                {!loadingMore && !hasNextPage && posts.length > 0 && (
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

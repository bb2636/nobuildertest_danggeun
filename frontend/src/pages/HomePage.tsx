import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { Carrot, MapPin, LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { locationsApi, type LocationItem } from '../api/locations'
import { postsApi, PostListItem } from '../api/posts'
import ImageWithFallback from '../components/ImageWithFallback'
import PostListSkeleton from '../components/PostListSkeleton'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { formatPrice } from '../utils/format'
import { STATUS_LABEL } from '../constants/post'

const PAGE_SIZE = 20

const CATEGORY_OPTIONS = [
  { value: '', label: '전체 카테고리' },
  { value: '디지털기기', label: '디지털기기' },
  { value: '가구/인테리어', label: '가구/인테리어' },
  { value: '식물', label: '식물' },
  { value: '생활용품', label: '생활용품' },
  { value: '의류', label: '의류' },
  { value: '기타', label: '기타' },
]

export default function HomePage() {
  const { user, logout } = useAuth()
  const [locationCode, setLocationCode] = useState('')
  const [category, setCategory] = useState('')
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await locationsApi.getList()
      return res.data.locations ?? []
    },
  })
  const locations = locationsData ?? []

  const {
    data,
    isLoading: loading,
    isError: isListError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage: loadingMore,
  } = useInfiniteQuery({
    queryKey: ['posts', locationCode, category, keyword],
    queryFn: async ({ pageParam }) => {
      const res = await postsApi.getList({
        page: pageParam,
        limit: PAGE_SIZE,
        locationCode: locationCode || undefined,
        category: category || undefined,
        keyword: keyword || undefined,
      })
      return res.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })

  const posts: PostListItem[] = data?.pages.flatMap((p) => p.posts) ?? []
  const error = isListError ? '게시글 목록을 불러오지 못했습니다.' : ''

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
      {/* 헤더: 모바일 퍼스트, 당근마켓 스타일 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-point-0 flex items-center justify-center">
            <Carrot className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-subhead text-gray-100">당근마켓 클론</h1>
            <Link
              to="/profile"
              className="text-body-12 text-gray-60 flex items-center gap-0.5 hover:text-point-0"
            >
              <MapPin className="w-3.5 h-3.5" />
              {user?.locationName || '동네 설정'}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            to="/my"
            className="w-9 h-9 rounded-full overflow-hidden bg-gray-10 flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
            aria-label="마이"
          >
            {user?.profileImageUrl ? (
              <ImageWithFallback
                src={user.profileImageUrl}
                alt=""
                className="w-full h-full object-cover"
                aspectRatio="square"
                fallbackText=""
              />
            ) : (
              <User className="w-5 h-5 text-gray-60" />
            )}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-full text-gray-60 hover:bg-gray-light transition-colors"
            aria-label="로그아웃"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 메인: 게시글 피드 */}
      <main className="flex-1 px-4 py-4">
        <section className="mb-4">
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-body-14 text-gray-60">중고거래 인기글</h2>
              <select
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
                className="text-body-12 text-gray-100 border border-gray-20 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-point-0"
              >
                <option value="">전체 동네</option>
                {locations.map((loc) => (
                  <option key={loc.code} value={loc.code}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-body-12 text-gray-100 border border-gray-20 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-point-0"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setKeyword(searchInput.trim())}
                placeholder="제목·내용 검색"
                className="flex-1 h-10 px-3 rounded-lg border border-gray-20 text-body-14 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0"
              />
              <button
                type="button"
                onClick={() => setKeyword(searchInput.trim())}
                className="h-10 px-4 rounded-lg bg-point-0 text-white text-body-14 font-medium"
              >
                검색
              </button>
            </div>
          </div>
          {loading && (
            <PostListSkeleton count={6} />
          )}
          {error && (
            <div className="py-8 text-center text-body-14 text-error">{error}</div>
          )}
          {!loading && !error && posts.length === 0 && (
            <EmptyState
              icon={Carrot}
              title="아직 게시글이 없어요"
              description="첫 게시글을 올려보세요."
            />
          )}
          {!loading && posts.length > 0 && (
            <>
              <ul className="space-y-0 divide-y divide-gray-10 bg-white rounded-xl overflow-hidden border border-gray-10">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </ul>
              <div ref={loadMoreRef} className="py-4 flex justify-center items-center gap-2">
                {loadingMore && (
                  <>
                    <Spinner size="sm" />
                    <span className="text-body-14 text-gray-60">더 불러오는 중...</span>
                  </>
                )}
                {!loadingMore && !hasNextPage && posts.length > 0 && (
                  <span className="text-body-12 text-gray-40">마지막 게시글입니다</span>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

function PostCard({ post }: { post: PostListItem }) {
  return (
    <li>
      <Link
        to={`/posts/${post.id}`}
        className="flex gap-3 p-4 hover:bg-grey-50 transition-colors block"
      >
        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
        <ImageWithFallback
          src={post.imageUrl ?? null}
          alt=""
          className="w-full h-full object-cover"
          aspectRatio="square"
          fallbackText="이미지 없음"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-body-16 font-medium text-gray-100 truncate">
          {post.title}
        </h3>
        <p className="text-subhead text-gray-100 mt-0.5">
          {formatPrice(post.price)}
        </p>
        <div className="flex items-center gap-2 mt-1.5 text-body-12 text-gray-60 flex-wrap">
          {post.category && <span>{post.category}</span>}
          {post.category && post.locationName && <span>·</span>}
          {post.locationName && <span>{post.locationName}</span>}
          <span>·</span>
          <span>{STATUS_LABEL[post.status] ?? post.status}</span>
        </div>
      </div>
      </Link>
    </li>
  )
}

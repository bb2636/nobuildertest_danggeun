import { type ReactNode, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronRight, MessageSquare, Search, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { postsApi, PostListItem } from '../api/posts'
import { communityApi, type CommunityPostListItem } from '../api/community'
import { searchApi } from '../api/search'
import ImageWithFallback from '../components/ImageWithFallback'
import PostListSkeleton from '../components/PostListSkeleton'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { formatPrice, formatRelativeTime } from '../utils/format'
import { STATUS_LABEL } from '../constants/post'

const PAGE_SIZE = 20
const PREVIEW_SIZE = 3

type SearchView = 'all' | 'posts' | 'community'

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 검색 키워드를 문자열/제목/내용에서 볼드 처리 (모든 매치) */
function highlightKeyword(text: string, keyword: string | undefined): ReactNode {
  if (!keyword || !text) return text
  const re = new RegExp(`(${escapeRegex(keyword)})`, 'gi')
  const parts = text.split(re)
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <strong key={i} className="font-bold">{part}</strong>
    ) : (
      part
    )
  )
}

function PostCard({ post, keyword }: { post: PostListItem; keyword?: string }) {
  const navigate = useNavigate()
  return (
    <li>
      <button
        type="button"
        onClick={() => navigate(`/posts/${post.id}`)}
        className="w-full flex gap-3 p-4 hover:bg-grey-50 transition-colors text-left"
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
            {keyword ? highlightKeyword(post.title, keyword) : post.title}
          </h3>
          <p className="text-subhead text-gray-100 mt-0.5">{formatPrice(post.price)}</p>
          <div className="flex items-center gap-2 mt-1.5 text-body-12 text-gray-60 flex-wrap">
            {post.locationName && <span>{post.locationName}</span>}
            <span>·</span>
            <span>{STATUS_LABEL[post.status] ?? post.status}</span>
          </div>
        </div>
      </button>
    </li>
  )
}

function CommunityCard({ post, keyword }: { post: CommunityPostListItem; keyword?: string }) {
  const navigate = useNavigate()
  return (
    <li>
      <button
        type="button"
        onClick={() => navigate(`/community/${post.id}`)}
        className="w-full block p-4 hover:bg-grey-50 transition-colors text-left"
      >
        <h3 className="text-body-16 font-medium text-gray-100 line-clamp-2">
          {keyword ? highlightKeyword(post.title, keyword) : post.title}
        </h3>
        {post.content && (
          <p className="text-body-14 text-gray-60 mt-0.5 line-clamp-2">
            {keyword ? highlightKeyword(post.content, keyword) : post.content}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 text-body-12 text-gray-50">
          {post.locationName && <span>{post.locationName}</span>}
          {post.locationName && <span>·</span>}
          <span>{formatRelativeTime(post.createdAt)}</span>
          <span className="flex items-center gap-0.5 ml-auto">
            <MessageSquare className="w-3.5 h-3.5" />
            {post.commentCount}
          </span>
        </div>
      </button>
    </li>
  )
}

const SUGGESTIONS_DEBOUNCE_MS = 200

export default function SearchPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [keyword, setKeyword] = useState('')
  const [view, setView] = useState<SearchView>('all')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const locationLabel = user?.locationName || '동네'
  const hasSearched = keyword.length > 0

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setDebouncedQuery('')
      return
    }
    const t = setTimeout(() => setDebouncedQuery(trimmed), SUGGESTIONS_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [query])

  const {
    data: suggestionsData,
    isFetching: suggestionsFetching,
  } = useQuery({
    queryKey: ['search', 'suggestions', debouncedQuery],
    queryFn: () => searchApi.getSuggestions(debouncedQuery).then((r) => r.data.suggestions ?? []),
    enabled: debouncedQuery.length >= 1,
    staleTime: 30 * 1000,
    retry: 1,
  })
  const suggestions: string[] = suggestionsData ?? []

  const postsQuery = useInfiniteQuery({
    queryKey: ['posts', 'search', keyword],
    queryFn: async ({ pageParam }) => {
      const res = await postsApi.getList({
        page: pageParam,
        limit: PAGE_SIZE,
        keyword: keyword || undefined,
      })
      return res.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: hasSearched,
  })

  const communityQuery = useInfiniteQuery({
    queryKey: ['community', 'search', keyword],
    queryFn: async ({ pageParam }) => {
      const res = await communityApi.getList({
        page: pageParam,
        limit: PAGE_SIZE,
        keyword: keyword || undefined,
      })
      return res.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: hasSearched,
  })

  const posts: PostListItem[] = postsQuery.data?.pages.flatMap((p) => p.posts) ?? []
  const communityPosts: CommunityPostListItem[] = communityQuery.data?.pages.flatMap((p) => p.posts) ?? []

  const postsPreview = posts.slice(0, PREVIEW_SIZE)
  const communityPreview = communityPosts.slice(0, PREVIEW_SIZE)
  const postsTotal = postsQuery.data?.pages[0]?.total ?? 0
  const communityTotal = communityQuery.data?.pages[0]?.total ?? 0

  const loading = hasSearched && (postsQuery.isLoading || communityQuery.isLoading)
  const anyResults = posts.length > 0 || communityPosts.length > 0
  const noResults = hasSearched && !loading && !anyResults

  const handleSearch = () => {
    setKeyword(query.trim())
    setView('all')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setKeyword(suggestion)
    setView('all')
  }

  const handleBack = () => {
    if (view !== 'all') {
      setView('all')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-3 py-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 -ml-1 rounded-full hover:bg-gray-10"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-5 h-5 text-gray-100" />
        </button>
        <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-lg bg-gray-10">
          <Search className="w-4 h-4 text-gray-50 flex-shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`${locationLabel} 근처에서 검색`}
            className="flex-1 min-w-0 bg-transparent text-body-14 text-gray-100 placeholder:text-gray-40 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            autoFocus
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="w-6 h-6 rounded-full bg-gray-30 flex items-center justify-center text-gray-60 flex-shrink-0"
              aria-label="입력 지우기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {!hasSearched && query.length === 0 && (
          <div className="px-4 py-8 text-center text-body-14 text-gray-50">
            검색어를 입력하고 엔터를 누르거나 검색해보세요.
          </div>
        )}

        {!hasSearched && query.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-10">
            <p className="text-body-12 text-gray-50 mb-2 flex items-center gap-1">
              <Search className="w-3.5 h-3.5" />
              연관 검색어
            </p>
            <ul className="space-y-0">
              {suggestions.length === 0 && (
                <li className="py-2 text-body-14 text-gray-50">
                  {suggestionsFetching ? '검색어를 찾는 중...' : debouncedQuery.length >= 1 ? '포함된 게시글이 없어요.' : '입력한 단어가 포함된 게시글을 찾습니다.'}
                </li>
              )}
              {suggestions.map((text) => (
                <li key={text}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(text)}
                    className="w-full flex items-center gap-2 py-2.5 text-left text-body-14 text-gray-100 hover:bg-gray-10 rounded-lg px-1 -mx-1"
                  >
                    <Search className="w-4 h-4 text-gray-40 flex-shrink-0" />
                    <span className="truncate">{text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasSearched && (
          <>
            <div className="px-4 py-2 border-b border-gray-10">
              <p className="text-body-12 text-gray-50 flex items-center gap-1">
                <Search className="w-3.5 h-3.5" />
                Q. {keyword}
              </p>
            </div>

            {loading && <PostListSkeleton count={6} />}

            {!loading && noResults && (
              <EmptyState
                icon={Search}
                title="검색 결과가 없어요"
                description="다른 검색어로 시도해보세요."
              />
            )}

            {!loading && anyResults && view === 'all' && (
              <div className="pb-6">
                {/* 중고거래 섹션 */}
                <section className="bg-white">
                  <div className="px-4 py-3 border-b border-gray-10">
                    <h2 className="text-body-16 font-semibold text-gray-100">중고거래</h2>
                  </div>
                  {postsPreview.length > 0 ? (
                    <>
                      <ul className="divide-y divide-gray-10">
                        {postsPreview.map((post) => (
                          <PostCard key={post.id} post={post} keyword={keyword || undefined} />
                        ))}
                      </ul>
                      <div className="px-4 py-3 border-t border-gray-10">
                        <button
                          type="button"
                          onClick={() => setView('posts')}
                          className="w-full flex items-center justify-center gap-1 text-body-14 text-gray-70 font-medium py-2"
                        >
                          중고거래 더보기
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-6 text-body-14 text-gray-50 text-center">
                      중고거래 검색 결과가 없어요
                    </div>
                  )}
                </section>

                {/* 동네생활 섹션 */}
                <section className="bg-white mt-2">
                  <div className="px-4 py-3 border-b border-gray-10">
                    <h2 className="text-body-16 font-semibold text-gray-100">동네생활</h2>
                  </div>
                  {communityPreview.length > 0 ? (
                    <>
                      <ul className="divide-y divide-gray-10">
                        {communityPreview.map((post) => (
                          <CommunityCard key={post.id} post={post} keyword={keyword || undefined} />
                        ))}
                      </ul>
                      <div className="px-4 py-3 border-t border-gray-10">
                        <button
                          type="button"
                          onClick={() => setView('community')}
                          className="w-full flex items-center justify-center gap-1 text-body-14 text-gray-70 font-medium py-2"
                        >
                          동네생활 더보기
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-6 text-body-14 text-gray-50 text-center">
                      동네생활 검색 결과가 없어요
                    </div>
                  )}
                </section>
              </div>
            )}

            {!loading && view === 'posts' && (
              <>
                <ul className="divide-y divide-gray-10 bg-white">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} keyword={keyword || undefined} />
                  ))}
                </ul>
                <div className="py-4 flex justify-center items-center gap-2">
                  {postsQuery.isFetchingNextPage && (
                    <>
                      <Spinner size="sm" />
                      <span className="text-body-14 text-gray-60">더 불러오는 중...</span>
                    </>
                  )}
                  {postsQuery.hasNextPage && !postsQuery.isFetchingNextPage && (
                    <button
                      type="button"
                      onClick={() => postsQuery.fetchNextPage()}
                      className="text-body-14 text-point-0 font-medium"
                    >
                      더 보기
                    </button>
                  )}
                </div>
              </>
            )}

            {!loading && view === 'community' && (
              <>
                <ul className="divide-y divide-gray-10 bg-white">
                  {communityPosts.map((post) => (
                    <CommunityCard key={post.id} post={post} keyword={keyword || undefined} />
                  ))}
                </ul>
                <div className="py-4 flex justify-center items-center gap-2">
                  {communityQuery.isFetchingNextPage && (
                    <>
                      <Spinner size="sm" />
                      <span className="text-body-14 text-gray-60">더 불러오는 중...</span>
                    </>
                  )}
                  {communityQuery.hasNextPage && !communityQuery.isFetchingNextPage && (
                    <button
                      type="button"
                      onClick={() => communityQuery.fetchNextPage()}
                      className="text-body-14 text-point-0 font-medium"
                    >
                      더 보기
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

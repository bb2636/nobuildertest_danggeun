import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MessageSquare, MapPin } from 'lucide-react'
import { communityApi, type CommunityPostListItem } from '../api/community'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { formatRelativeTime } from '../utils/format'

const PAGE_SIZE = 20

export default function MyCommunityPostsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    communityApi.markNotificationsRead().then(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] })
    }).catch(() => {})
  }, [queryClient])

  const {
    data,
    isLoading: loading,
    isError: isListError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage: loadingMore,
  } = useInfiniteQuery({
    queryKey: ['community', 'my-posts'],
    queryFn: async ({ pageParam }) => {
      const res = await communityApi.getMyPosts({ page: pageParam, limit: PAGE_SIZE })
      return res.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })

  const posts: CommunityPostListItem[] = data?.pages.flatMap((p) => p.posts) ?? []
  const error = isListError ? '글 목록을 불러오지 못했습니다.' : ''

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
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-light transition-colors"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-5 h-5 text-gray-100" />
        </button>
        <h1 className="text-subhead text-gray-100">내 동네생활 글</h1>
      </header>
      <main className="flex-1 px-4 py-4">
        {loading && (
          <div className="py-12 flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <span className="text-body-14 text-gray-60">로딩 중...</span>
          </div>
        )}
        {error && (
          <div className="py-8 text-center text-body-14 text-error">{error}</div>
        )}
        {!loading && !error && posts.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title="아직 작성한 글이 없어요"
            description="동네생활에 첫 글을 올려보세요."
            action={
              <Link
                to="/community/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-point-0 text-white text-body-14 font-medium"
              >
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
              {!loadingMore && !hasNextPage && posts.length > 0 && (
                <span className="text-body-12 text-gray-40">마지막 글입니다</span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

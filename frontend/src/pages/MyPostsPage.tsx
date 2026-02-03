import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft } from 'lucide-react'
import { postsApi, PostListItem } from '../api/posts'
import ImageWithFallback from '../components/ImageWithFallback'
import PostListSkeleton from '../components/PostListSkeleton'
import EmptyState from '../components/EmptyState'
import { formatPrice } from '../utils/format'
import { STATUS_LABEL } from '../constants/post'

export default function MyPostsPage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchList = useCallback(() => {
    setError('')
    setLoading(true)
    postsApi
      .getList({ my: true, limit: 50 })
      .then((res) => setPosts(res.data.posts ?? []))
      .catch(() => {
        setPosts([])
        setError('내 게시글을 불러오지 못했어요.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  return (
    <div className="min-h-screen bg-grey-50 flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-10 px-4 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/my')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-light"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-5 h-5 text-gray-100" />
        </button>
        <h1 className="text-subhead text-gray-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-point-0" />
          내 게시글
        </h1>
      </header>
      <main className="flex-1 px-4 py-4">
        {loading && <PostListSkeleton count={5} />}
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
            icon={FileText}
            title="작성한 게시글이 없어요"
            description="첫 게시글을 올려보세요."
          />
        )}
        {!loading && !error && posts.length > 0 && (
          <ul className="space-y-0 divide-y divide-gray-10 bg-white rounded-xl overflow-hidden border border-gray-10">
            {posts.map((post) => (
              <li key={post.id}>
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
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

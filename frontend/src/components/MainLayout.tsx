import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Carrot, MessageCircle, User, Plus, MessageSquare } from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'
import { useAuth } from '../contexts/AuthContext'
import { notificationsApi } from '../api/notifications'
import { getChatSocket } from '../lib/socket'

const tabs = [
  { path: '/', label: '홈', icon: Carrot },
  { path: '/community', label: '동네생활', icon: MessageSquare, badgeKey: 'communityCommentCount' as const },
  { path: '/chat', label: '채팅', icon: MessageCircle, badgeKey: 'chatUnreadCount' as const },
  { path: '/my', label: '마이', icon: User },
] as const

const NAV_HEIGHT = 64

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const isHome = location.pathname === '/'
  const isCommunity =
    location.pathname === '/community' ||
    (location.pathname.startsWith('/community/') &&
      !/^\/community\/(new|\d+\/edit)$/.test(location.pathname))

  const { data: counts } = useQuery({
    queryKey: ['notifications', 'counts'],
    queryFn: () => notificationsApi.getCounts().then((res) => res.data),
    enabled: !!token,
    refetchInterval: 10 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  useEffect(() => {
    if (!token) return
    const socket = getChatSocket(token)
    if (!socket) return
    const onChatListUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] })
    }
    socket.on('chat_list_updated', onChatListUpdated)
    return () => {
      socket.off('chat_list_updated', onChatListUpdated)
    }
  }, [token, queryClient])

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="flex-1" role="main">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {/* 홈: 중고상품 등록 / 동네생활: 게시글 등록 - 동일 위치·크기 (메뉴바 바로 위 오른쪽) */}
      {isHome && (
        <Link
          to="/posts/new"
          className="fixed right-4 z-20 w-14 h-14 rounded-full bg-point-0 text-white flex items-center justify-center shadow-lg hover:bg-point-0/90 active:scale-95 transition-all"
          style={{ bottom: NAV_HEIGHT + 8 }}
          aria-label="글쓰기"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </Link>
      )}
      {isCommunity && (
        <Link
          to="/community/new"
          className="fixed right-4 z-20 w-14 h-14 rounded-full bg-point-0 text-white flex items-center justify-center shadow-lg hover:bg-point-0/90 active:scale-95 transition-all"
          style={{ bottom: NAV_HEIGHT + 8 }}
          aria-label="동네생활 글쓰기"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </Link>
      )}
      <nav
        className="fixed bottom-0 left-0 right-0 max-w-mobile mx-auto bg-white border-t border-gray-10 flex justify-around py-2 safe-area-pb z-10"
        style={{ height: NAV_HEIGHT }}
        aria-label="메인 메뉴"
      >
        {tabs.map(({ path, label, icon: Icon, badgeKey }) => {
          const isActive =
            path === '/'
              ? location.pathname === '/'
              : path === '/my'
                ? location.pathname === '/my' || location.pathname === '/profile' || location.pathname === '/posts/mine'
                : path === '/community'
                  ? location.pathname === '/community' || location.pathname.startsWith('/community/')
                  : location.pathname.startsWith(path)
          const badgeCount = badgeKey && counts ? counts[badgeKey] : 0
          const showBadge = badgeCount > 0
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`relative flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg transition-colors ${
                isActive ? 'text-point-0' : 'text-gray-50'
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative inline-block">
                <Icon
                  className={`w-6 h-6 ${isActive ? 'text-point-0' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {showBadge && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-point-0 text-white text-body-12 font-medium"
                    aria-hidden
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </span>
              <span className="text-body-12">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

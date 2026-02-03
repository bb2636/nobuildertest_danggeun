import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { Carrot, Heart, MessageCircle, User, Plus, MessageSquare } from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'

const tabs = [
  { path: '/', label: '홈', icon: Carrot },
  { path: '/community', label: '동네생활', icon: MessageSquare },
  { path: '/my', label: '마이', icon: User },
  { path: '/favorites', label: '찜', icon: Heart },
  { path: '/chat', label: '채팅', icon: MessageCircle },
] as const

const NAV_HEIGHT = 64

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="flex-1" role="main">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {/* 당근마켓 스타일 글쓰기 플로팅 버튼: 홈에서만, 메뉴바 바로 위 오른쪽 */}
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
      <nav
        className="fixed bottom-0 left-0 right-0 max-w-mobile mx-auto bg-white border-t border-gray-10 flex justify-around py-2 safe-area-pb z-10"
        style={{ height: NAV_HEIGHT }}
        aria-label="메인 메뉴"
      >
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive =
            path === '/'
              ? location.pathname === '/'
              : path === '/my'
                ? location.pathname === '/my' || location.pathname === '/profile' || location.pathname === '/posts/mine'
                : path === '/community'
                  ? location.pathname === '/community' || location.pathname.startsWith('/community/')
                  : location.pathname.startsWith(path)
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg transition-colors ${
                isActive ? 'text-point-0' : 'text-gray-50'
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-6 h-6 ${isActive ? 'text-point-0' : ''}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-body-12">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { User, FileText, Heart, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const menuItems = [
  { to: '/profile', icon: User, label: '프로필 수정', description: '닉네임, 동네 설정' },
  { to: '/posts/mine', icon: FileText, label: '내 게시글', description: '작성한 게시글 목록' },
  { to: '/favorites', icon: Heart, label: '찜 목록', description: '찜한 게시글' },
] as const

export default function MyPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-grey-50 flex flex-col">
      <header className="bg-white border-b border-gray-10 px-4 py-4 flex items-center gap-3">
        {user && (
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-10">
            <ImageWithFallback
              src={user.profileImageUrl}
              alt=""
              className="w-full h-full object-cover"
              aspectRatio="square"
              fallbackText=""
            />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-subhead text-gray-100">마이</h1>
          {user && (
            <p className="text-body-14 text-gray-60 mt-0.5 truncate">
              {user.nickname}
              {user.locationName && ` · ${user.locationName}`}
            </p>
          )}
        </div>
      </header>
      <main className="flex-1 px-4 py-4">
        <nav className="bg-white rounded-xl border border-gray-10 overflow-hidden">
          <ul className="divide-y divide-gray-10">
            {menuItems.map(({ to, icon: Icon, label, description }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex items-center gap-3 p-4 hover:bg-grey-50 active:bg-gray-10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-10 flex items-center justify-center text-gray-70">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-16 font-medium text-gray-100">{label}</p>
                    <p className="text-body-12 text-gray-50 truncate">{description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-40 flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  )
}

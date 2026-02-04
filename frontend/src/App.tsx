import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import MainLayout from './components/MainLayout'
import ChatListPage from './pages/ChatListPage'
import ChatRoomPage from './pages/ChatRoomPage'
import CommunityPage from './pages/CommunityPage'
import CommunityPostDetailPage from './pages/CommunityPostDetailPage'
import CommunityPostFormPage from './pages/CommunityPostFormPage'
import FavoritesPage from './pages/FavoritesPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MyPage from './pages/MyPage'
import MyPostsPage from './pages/MyPostsPage'
import MyCommunityPostsPage from './pages/MyCommunityPostsPage'
import MyCommentsPage from './pages/MyCommentsPage'
import PostDetailPage from './pages/PostDetailPage'
import PostChatListPage from './pages/PostChatListPage'
import PostFormPage from './pages/PostFormPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import SignUpPage from './pages/SignUpPage'
import SetLocationPage from './pages/SetLocationPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth()
  const location = useLocation()
  if (!token) return <Navigate to="/login" replace />
  const needsLocation = user && !user.locationName && !user.locationCode
  const isSetLocationPage = location.pathname === '/set-location'
  if (needsLocation && !isSetLocationPage) return <Navigate to="/set-location" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-white max-w-mobile mx-auto">
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/set-location"
            element={
              <ProtectedRoute>
                <SetLocationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="community/new" element={<CommunityPostFormPage />} />
            <Route path="community/:id/edit" element={<CommunityPostFormPage />} />
            <Route path="community/:id" element={<CommunityPostDetailPage />} />
            <Route path="my" element={<MyPage />} />
            <Route path="my/community-posts" element={<MyCommunityPostsPage />} />
            <Route path="my/comments" element={<MyCommentsPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="chat" element={<ChatListPage />} />
            <Route path="chat/:roomId" element={<ChatRoomPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="posts/mine" element={<MyPostsPage />} />
            <Route path="posts/:id/chats" element={<PostChatListPage />} />
            <Route path="posts/:id" element={<ErrorBoundary><PostDetailPage /></ErrorBoundary>} />
          </Route>
          <Route
            path="/posts/new"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <PostFormPage />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/posts/:id/edit"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <PostFormPage />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { authApi, AuthUser, UpdateProfileRequest } from '../api/auth'
import { disconnectChatSocket } from '../lib/socket'

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  login: (email: string, password: string) => Promise<unknown>
  signUp: (params: {
    email: string
    password: string
    nickname: string
    locationName?: string
    locationCode?: string
  }) => Promise<unknown>
  updateProfile: (data: UpdateProfileRequest) => Promise<void>
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('accessToken')
  )
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    if (!token) return
    authApi
      .getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('accessToken')
        setToken(null)
      })
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('accessToken', data.accessToken)
    setToken(data.accessToken)
    setUser(data.user)
    return data
  }, [])

  const signUp = useCallback(
    async (params: {
      email: string
      password: string
      nickname: string
      locationName?: string
      locationCode?: string
    }) => {
      const { data } = await authApi.signUp(params)
      localStorage.setItem('accessToken', data.accessToken)
      setToken(data.accessToken)
      setUser(data.user)
      return data
    },
    []
  )

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    const { data: res } = await authApi.updateMe(data)
    setUser(res.user)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token) return
    const res = await authApi.getMe()
    setUser(res.data.user)
  }, [token])

  const logout = useCallback(() => {
    disconnectChatSocket()
    localStorage.removeItem('accessToken')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, signUp, updateProfile, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

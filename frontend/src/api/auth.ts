import { api } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  email: string
  password: string
  nickname: string
  locationName?: string
  locationCode?: string
}

export interface AuthUser {
  id: number
  email: string
  nickname: string
  profileImageUrl: string | null
  locationName: string | null
  locationCode: string | null
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  expiresIn: string
}

export interface MeResponse {
  user: AuthUser
}

export interface UpdateProfileRequest {
  nickname?: string
  locationName?: string | null
  locationCode?: string | null
  profileImageUrl?: string | null
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', data),

  signUp: (data: SignUpRequest) =>
    api.post<AuthResponse>('/api/auth/signup', data),

  getMe: () => api.get<MeResponse>('/api/auth/me'),

  updateMe: (data: UpdateProfileRequest) =>
    api.patch<MeResponse>('/api/auth/me', data),
}

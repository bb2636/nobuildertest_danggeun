import axios, { type AxiosError } from 'axios'
import type { ApiErrorResponse } from '../types/api'

const API_BASE = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

/** API 에러 타입 (인터셉터/ catch에서 response.data 사용 시) */
export type ApiError = AxiosError<ApiErrorResponse>

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRequest =
      err.config?.url?.includes('/api/auth/login') ||
      err.config?.url?.includes('/api/auth/signup')
    if (err.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

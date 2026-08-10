import api from './client'
import type { AuthUser, RegisterPayload } from '../types'

interface AuthResponse {
  success: boolean
  message?: string
  data?: {
    userId: string
    token: string
    name?: string
    username?: string
    email?: string
  }
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await api.post<AuthResponse>('/users/login', { username, password })
  if (!res.data?.success || !res.data.data) {
    throw new Error(res.data?.message || 'Đăng nhập thất bại')
  }

  const { userId, ...rest } = res.data.data
  return { ...rest, id: userId }
}

export async function register(data: RegisterPayload): Promise<void> {
  const res = await api.post<AuthResponse>('/users/register', data)
  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Đăng ký thất bại')
  }
}

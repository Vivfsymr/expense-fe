import { defineStore } from 'pinia'
import * as authApi from '../api/auth'
import type { AuthUser, RegisterPayload } from '../types'

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('user')
  if (!raw || raw === 'undefined') return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: readStoredUser() as AuthUser | null,
  }),
  actions: {
    async login(username: string, password: string) {
      const user = await authApi.login(username, password)
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    async register(data: RegisterPayload) {
      await authApi.register(data)
    },
    logout() {
      this.user = null
      localStorage.removeItem('user')
    },
    clearUserData() {
      this.logout()
    },
  },
})

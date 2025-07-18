import { defineStore } from 'pinia';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: (() => {
      const raw = localStorage.getItem('user');
      if (!raw || raw === 'undefined') return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    })(),
  }),
  actions: {
    async login(username: string, password: string) {
      const res = await axios.post(`${API_URL}/users/login`, { username, password });
      if (res.data && res.data.success) {
        this.user = res.data.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } else {
        throw new Error(res.data.message || 'Đăng nhập thất bại');
      }
    },
    async register(data: { username: string; password: string; email: string; name: string }) {
      const res = await axios.post(`${API_URL}/users/register`, data);
      if (!res.data || !res.data.success) {
        throw new Error(res.data?.message || 'Đăng ký thất bại');
      }
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user');
    },
  },
  
}); 
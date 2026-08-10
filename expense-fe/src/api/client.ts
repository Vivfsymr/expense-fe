import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.request.use((config) => {
  if (
    config.url?.includes('/users/login') ||
    config.url?.includes('/users/register')
  ) {
    return config
  }

  const userStr = localStorage.getItem('user')
  if (!userStr) return config

  try {
    const user = JSON.parse(userStr)
    if (user?.token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${user.token}`
    }
  } catch {
    // ignore invalid localStorage
  }

  return config
})

export default api

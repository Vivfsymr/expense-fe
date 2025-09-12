import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    console.log('userStr1');

  // Không thêm token cho login/register
  if (
    !config.url?.includes('/users/login') &&
    !config.url?.includes('/users/register')
  ) {

    const userStr = localStorage.getItem('user');
    console.log('userStr', userStr);
    let token = '';
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.token;
      } catch (e) {
        token = '';
      }
    }
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api; 
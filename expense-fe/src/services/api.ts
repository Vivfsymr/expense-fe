import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and cleanup
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Handle Token Expired (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't auto-redirect or refresh for login/google auth (standard login failures)
      const authEndpoints = ['/auth/login/', '/auth/google/', '/auth/register/'];
      const isAuthRequest = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));
      
      if (isAuthRequest) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Try to refresh the token
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.clear();
        
        // Redirect logic based on current path
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // 2. Handle Invalid Token / Port Change 
    // Ini krusial jika pengguna pindah port atau ada sisa token rusak di browser
    const errorDetail = error.response?.data?.detail;
    if (
      error.response?.data?.code === 'token_not_valid' ||
      (typeof errorDetail === 'string' && errorDetail.includes('token_not_valid'))
    ) {
      console.warn('Invalid token detected, clearing local storage...');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export default api;

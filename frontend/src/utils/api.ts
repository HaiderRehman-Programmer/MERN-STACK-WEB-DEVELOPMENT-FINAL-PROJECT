import axios from 'axios';

// Use environment variable in production, fallback to localhost for development
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const ASSET_URL = `${BASE_URL}/uploads`;

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // If 401 occurred and we haven't tried to refresh yet
    // Don't retry refresh for auth hydration endpoints — they naturally 401 when not logged in
    const skipRefreshPaths = ['/auth/me', '/auth/refresh', '/login', '/register'];
    const isSkipPath = skipRefreshPaths.some(p => originalRequest.url?.endsWith(p));

    if (error.response && error.response.status === 401 && !originalRequest._retry && !isSkipPath) {
      originalRequest._retry = true;

      try {
        const res = await api.post('/auth/refresh');
        const { accessToken } = res.data.data;

        // Update Default Authorize Header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // Update the failed request header
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear everything and redirect to login
        localStorage.removeItem('user'); // Just in case it's here
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

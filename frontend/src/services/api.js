import axios from 'axios';

// Ensure baseURL is normalized properly for both local dev and production deployments
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api';
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  if (trimmed.startsWith('http') && !trimmed.endsWith('/api')) {
    return `${trimmed}/api`;
  }
  return trimmed;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to prevent URL stripping when baseURL has path prefix like /api
api.interceptors.request.use(
  (config) => {
    // If baseURL is absolute (http/https) and has a subpath like /api,
    // and config.url starts with '/', prevent Axios from stripping the subpath
    if (config.baseURL && config.baseURL.startsWith('http')) {
      const baseObj = new URL(config.baseURL);
      const basePath = baseObj.pathname.replace(/\/+$/, '');
      if (basePath && config.url && config.url.startsWith('/') && !config.url.startsWith(basePath)) {
        config.url = `${basePath}${config.url}`;
        config.baseURL = baseObj.origin;
      }
    }

    const token = localStorage.getItem('resqfood_token') || localStorage.getItem('foodresq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 Unauthorized if not on auth routes
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('resqfood_token');
        localStorage.removeItem('resqfood_user');
        localStorage.removeItem('foodresq_token');
        localStorage.removeItem('foodresq_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

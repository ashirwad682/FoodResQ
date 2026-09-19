import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Bearer token to all outgoing requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodresq_token');
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
        localStorage.removeItem('foodresq_token');
        localStorage.removeItem('foodresq_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

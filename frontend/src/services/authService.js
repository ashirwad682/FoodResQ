import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('/auth/login/', { username, password });
    if (response.data.access) {
      localStorage.setItem('foodresq_token', response.data.access);
      localStorage.setItem('foodresq_refresh', response.data.refresh);
      localStorage.setItem('foodresq_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register/', userData);
    if (response.data.tokens?.access) {
      localStorage.setItem('foodresq_token', response.data.tokens.access);
      localStorage.setItem('foodresq_refresh', response.data.tokens.refresh);
      localStorage.setItem('foodresq_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout/');
    } finally {
      localStorage.removeItem('foodresq_token');
      localStorage.removeItem('foodresq_refresh');
      localStorage.removeItem('foodresq_user');
    }
  },

  async getProfile() {
    const response = await api.get('/auth/profile/');
    localStorage.setItem('foodresq_user', JSON.stringify(response.data));
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch('/auth/profile/', data);
    localStorage.setItem('foodresq_user', JSON.stringify(response.data));
    return response.data;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('foodresq_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('foodresq_token');
  },
};

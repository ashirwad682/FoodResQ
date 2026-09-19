import api from './api';

export const analyticsService = {
  async getDashboard() {
    const response = await api.get('/analytics/dashboard/');
    return response.data;
  },

  async getLeaderboard() {
    const response = await api.get('/analytics/leaderboard/');
    return response.data;
  },

  async getMyImpact() {
    const response = await api.get('/analytics/my-impact/');
    return response.data;
  },
};

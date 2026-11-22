import api from './api';

export const adminService = {
  async getAdminMetrics() {
    const response = await api.get('/analytics/admin/');
    return response.data;
  },

  async getNgos(params = {}) {
    const response = await api.get('/organizations/', { params });
    return response.data;
  },

  async verifyNgo(id, action = 'approve') {
    const response = await api.post(`/organizations/${id}/verify/`, { action });
    return response.data;
  },

  async getAllDonations(params = {}) {
    const response = await api.get('/donations/', { params });
    return response.data;
  },

  async getAllPickups(params = {}) {
    const response = await api.get('/pickups/assignments/', { params });
    return response.data;
  },

  async getAllUsers(params = {}) {
    const response = await api.get('/auth/users/', { params });
    return response.data;
  },

  async getAllClaims(params = {}) {
    const response = await api.get('/pickups/requests/', { params });
    return response.data;
  },
};

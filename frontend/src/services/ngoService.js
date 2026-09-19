import api from './api';

export const ngoService = {
  async getOrganizations(params = {}) {
    const response = await api.get('/organizations/', { params });
    return response.data;
  },

  async getOrganization(id) {
    const response = await api.get(`/organizations/${id}/`);
    return response.data;
  },

  async updateOrganization(id, data) {
    const response = await api.patch(`/organizations/${id}/`, data);
    return response.data;
  },
};

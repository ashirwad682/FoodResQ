import api from './api';

export const donationService = {
  async getDonations(params = {}) {
    const response = await api.get('/donations/', { params });
    return response.data;
  },

  async getDonation(id) {
    const response = await api.get(`/donations/${id}/`);
    return response.data;
  },

  async createDonation(data) {
    const response = await api.post('/donations/', data);
    return response.data;
  },

  async updateDonation(id, data) {
    const response = await api.patch(`/donations/${id}/`, data);
    return response.data;
  },

  async deleteDonation(id) {
    const response = await api.delete(`/donations/${id}/`);
    return response.data;
  },
};

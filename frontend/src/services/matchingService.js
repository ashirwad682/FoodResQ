import api from './api';

export const matchingService = {
  async getMatchedNGOs(donationId) {
    const response = await api.get(`/matching/donations/${donationId}/ngos/`);
    return response.data;
  },

  async getMatchedVolunteers(donationId) {
    const response = await api.get(`/matching/donations/${donationId}/volunteers/`);
    return response.data;
  },

  async triggerAutoMatch(donationId) {
    const response = await api.post(`/matching/donations/${donationId}/auto-match/`);
    return response.data;
  },
};

import api from './api';

export const pickupService = {
  async createRequest(data) {
    const response = await api.post('/pickups/request/', data);
    return response.data;
  },

  async getRequests(params = {}) {
    const response = await api.get('/pickups/requests/', { params });
    return response.data;
  },

  async approveRequest(id) {
    const response = await api.post(`/pickups/requests/${id}/approve/`);
    return response.data;
  },

  async rejectRequest(id) {
    const response = await api.post(`/pickups/requests/${id}/reject/`);
    return response.data;
  },

  async getAssignments(params = {}) {
    const response = await api.get('/pickups/assignments/', { params });
    return response.data;
  },

  async acceptAssignment(id) {
    const response = await api.post(`/pickups/assignments/${id}/accept/`);
    return response.data;
  },

  async collectFood(id, data = {}) {
    const response = await api.post(`/pickups/assignments/${id}/collect/`, data);
    return response.data;
  },

  async deliverFood(id, data = {}) {
    const response = await api.post(`/pickups/assignments/${id}/deliver/`, data);
    return response.data;
  },

  async confirmDelivery(id, data = {}) {
    const response = await api.post(`/pickups/assignments/${id}/confirm/`, data);
    return response.data;
  },

  async getHistory(donationId) {
    const response = await api.get(`/pickups/history/${donationId}/`);
    return response.data;
  },
};

import api from './api';

export const volunteerService = {
  async getVolunteers(params = {}) {
    const response = await api.get('/volunteers/', { params });
    return response.data;
  },

  async updateStatus(data) {
    const response = await api.patch('/volunteers/status/', data);
    return response.data;
  },

  async getActiveAssignment() {
    const response = await api.get('/volunteers/active-assignment/');
    return response.data;
  },
};

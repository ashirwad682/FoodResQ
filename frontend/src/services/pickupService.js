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

  async cancelRequest(id) {
    const response = await api.post(`/pickups/requests/${id}/cancel/`);
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

  // Verification & Chain of Custody Methods
  async uploadPhoto(fileOrBase64) {
    if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      const formData = new FormData();
      formData.append('photo', fileOrBase64);
      const response = await api.post('/pickups/upload-photo/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      const response = await api.post('/pickups/upload-photo/', { photo_data: fileOrBase64 });
      return response.data;
    }
  },

  async updateStatus(id, status) {
    const response = await api.post(`/pickups/assignments/${id}/status/`, { status });
    return response.data;
  },

  async submitCollectionEvidence(id, data) {
    const response = await api.post(`/pickups/assignments/${id}/collection-evidence/`, data);
    return response.data;
  },

  async generateOtp(id) {
    const response = await api.post(`/pickups/assignments/${id}/generate-otp/`);
    return response.data;
  },

  async submitHandoverEvidence(id, data) {
    const response = await api.post(`/pickups/assignments/${id}/handover-evidence/`, data);
    return response.data;
  },

  async verifyOtp(id, data) {
    const response = await api.post(`/pickups/assignments/${id}/verify-otp/`, data);
    return response.data;
  },

  async getVerification(id) {
    const response = await api.get(`/pickups/assignments/${id}/verification/`);
    return response.data;
  },

  async getAuditVerifications(params = {}) {
    const response = await api.get('/pickups/verifications/audit/', { params });
    return response.data;
  },

  async getHistory(donationId) {
    const response = await api.get(`/pickups/history/${donationId}/`);
    return response.data;
  },
};

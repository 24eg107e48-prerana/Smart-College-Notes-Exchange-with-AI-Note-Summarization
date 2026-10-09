import api from './api';

export const adminService = {
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async getNotes(params = {}) {
    const response = await api.get('/admin/notes', { params });
    return response.data;
  },

  async approveNote(id) {
    const response = await api.put(`/admin/notes/${id}/approve`);
    return response.data;
  },

  async rejectNote(id) {
    const response = await api.put(`/admin/notes/${id}/reject`);
    return response.data;
  },

  async deleteNote(id) {
    const response = await api.delete(`/admin/notes/${id}`);
    return response.data;
  },
};

import api from './api';

export const noteService = {
  async getNotes(params = {}) {
    const response = await api.get('/notes', { params });
    return response.data;
  },

  async searchNotes(params = {}) {
    const response = await api.get('/notes/search', { params });
    return response.data;
  },

  async getNoteById(id) {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  async uploadNote(formData) {
    const response = await api.post('/notes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteNote(id) {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  async downloadNote(id, fileName) {
    const response = await api.get(`/notes/${id}/download`, {
      responseType: 'blob',
    });
    // Create download link in browser
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName || `note-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  async bookmarkNote(id) {
    const response = await api.post(`/notes/${id}/bookmark`);
    return response.data;
  },

  async removeBookmark(id) {
    const response = await api.delete(`/notes/${id}/bookmark`);
    return response.data;
  },

  async getSavedNotes(params = {}) {
    const response = await api.get('/notes/saved', { params });
    return response.data;
  },

  async getMyNotes(params = {}) {
    const response = await api.get('/notes/my-notes', { params });
    return response.data;
  },

  async reviewNote(id, reviewData) {
    const response = await api.post(`/notes/${id}/review`, reviewData);
    return response.data;
  },

  async getNoteReviews(id) {
    const response = await api.get(`/notes/${id}/reviews`);
    return response.data;
  },
};

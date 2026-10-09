import api from './api';

export const aiService = {
  async summarizeNote(noteId, force = false) {
    const response = await api.post(`/ai/summarize/${noteId}?force=${force}`);
    return response.data;
  },

  async getNoteSummary(noteId) {
    const response = await api.get(`/ai/summary/${noteId}`);
    return response.data;
  },

  async askStudyAssistant(noteId, question) {
    const response = await api.post('/ai/ask', { noteId, question });
    return response.data;
  },
};

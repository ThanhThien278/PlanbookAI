import api from './api';

export const lessonService = {
  getAll: (params = {}) => api.get('/lessons', { params }),
  getById: (id) => api.get(`/lessons/${id}`),
  create: (data) => api.post('/lessons', data),
  update: (id, data) => api.put(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
  duplicate: (id) => api.post(`/lessons/${id}/duplicate`),
  generateWithAI: (prompt) => api.post('/lessons/generate', prompt),
  getTemplates: () => api.get('/templates'),
  getStats: () => api.get('/lessons/stats/summary'),
};
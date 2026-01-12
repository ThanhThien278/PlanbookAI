import api from './api';

export const examService = {
  getAll: (params = {}) => api.get('/exams', { params }),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  addQuestions: (id, questionIds) => 
    api.post(`/exams/${id}/questions`, { question_ids: questionIds }),
  publish: (id) => api.post(`/exams/${id}/publish`),
};
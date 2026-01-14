import api from './api';

export const ocrService = {
  uploadForGrading: (examId, formData) => 
    api.post(`/ocr/grading/${examId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getGradingStatus: (taskId) => api.get(`/ocr/status/${taskId}`),
  getGradingResults: (examId) => api.get(`/ocr/results/${examId}`),
};





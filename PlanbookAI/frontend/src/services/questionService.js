import api from './api';
import { mockQuestionService } from './mockDataService';

// ✅ Sử dụng mock data nếu API không có, fallback về mock
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true' || true; // Default to true

const handleRequest = async (apiCall, mockCall) => {
  if (USE_MOCK_DATA) {
    try {
      // Thử API trước, nếu fail thì dùng mock
      return await apiCall();
    } catch (error) {
      // API không có hoặc lỗi, dùng mock data
      console.log('Using mock data for questions');
      return await mockCall();
    }
  } else {
    return await apiCall();
  }
};

export const questionService = {
  getAll: async (params = {}) => {
    return handleRequest(
      () => api.get('/questions', { params }),
      () => mockQuestionService.getAll(params)
    );
  },
  
  getById: async (id) => {
    return handleRequest(
      () => api.get(`/questions/${id}`),
      () => mockQuestionService.getById(id)
    );
  },
  
  create: async (data) => {
    return handleRequest(
      () => api.post('/questions', data),
      () => mockQuestionService.create(data)
    );
  },
  
  update: async (id, data) => {
    return handleRequest(
      () => api.put(`/questions/${id}`, data),
      () => mockQuestionService.update(id, data)
    );
  },
  
  delete: async (id) => {
    return handleRequest(
      () => api.delete(`/questions/${id}`),
      () => mockQuestionService.delete(id)
    );
  },
  
  approve: async (id) => {
    return handleRequest(
      () => api.post(`/questions/${id}/approve`),
      () => mockQuestionService.approve(id)
    );
  },
  
  getStats: async () => {
    return handleRequest(
      () => api.get('/questions/stats/summary'),
      () => mockQuestionService.getStats()
    );
  },
};

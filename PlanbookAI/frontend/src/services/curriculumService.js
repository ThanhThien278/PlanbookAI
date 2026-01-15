import api from './api';
import { mockCurriculumService } from './mockDataService';

const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true' || true;

const handleRequest = async (apiCall, mockCall) => {
  if (USE_MOCK_DATA) {
    try {
      return await apiCall();
    } catch (error) {
      console.log('Using mock data for curriculum');
      return await mockCall();
    }
  } else {
    return await apiCall();
  }
};

export const curriculumService = {
  getAll: async () => {
    return handleRequest(
      () => api.get('/curriculum'),
      () => mockCurriculumService.getAll()
    );
  },
  
  getById: async (id) => {
    return handleRequest(
      () => api.get(`/curriculum/${id}`),
      () => mockCurriculumService.getById(id)
    );
  },
  
  create: async (data) => {
    return handleRequest(
      () => api.post('/curriculum', data),
      () => mockCurriculumService.create(data)
    );
  },
  
  update: async (id, data) => {
    return handleRequest(
      () => api.put(`/curriculum/${id}`, data),
      () => mockCurriculumService.update(id, data)
    );
  },
  
  delete: async (id) => {
    return handleRequest(
      () => api.delete(`/curriculum/${id}`),
      () => mockCurriculumService.delete(id)
    );
  },
};


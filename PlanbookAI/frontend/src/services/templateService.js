import api from './api';
import { mockTemplateService } from './mockDataService';

const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true' || true;

const handleRequest = async (apiCall, mockCall) => {
  if (USE_MOCK_DATA) {
    try {
      return await apiCall();
    } catch (error) {
      console.log('Using mock data for templates');
      return await mockCall();
    }
  } else {
    return await apiCall();
  }
};

export const templateService = {
  getAll: async () => {
    return handleRequest(
      () => api.get('/templates'),
      () => mockTemplateService.getAll()
    );
  },
  
  getById: async (id) => {
    return handleRequest(
      () => api.get(`/templates/${id}`),
      () => mockTemplateService.getById(id)
    );
  },
  
  create: async (data) => {
    return handleRequest(
      () => api.post('/templates', data),
      () => mockTemplateService.create(data)
    );
  },
  
  update: async (id, data) => {
    return handleRequest(
      () => api.put(`/templates/${id}`, data),
      () => mockTemplateService.update(id, data)
    );
  },
  
  delete: async (id) => {
    return handleRequest(
      () => api.delete(`/templates/${id}`),
      () => mockTemplateService.delete(id)
    );
  },
};


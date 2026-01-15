import api from './api';
import { mockUserService } from './mockDataService';

const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true' || true;

const handleRequest = async (apiCall, mockCall) => {
  if (USE_MOCK_DATA) {
    try {
      return await apiCall();
    } catch (error) {
      console.log('Using mock data for users');
      return await mockCall();
    }
  } else {
    return await apiCall();
  }
};

export const userService = {
  getAll: async (params = {}) => {
    return handleRequest(
      () => api.get('/users', { params }),
      () => mockUserService.getAll(params)
    );
  },
  
  getById: async (id) => {
    return handleRequest(
      () => api.get(`/users/${id}`),
      () => mockUserService.getById(id)
    );
  },
  
  create: async (data) => {
    return handleRequest(
      () => api.post('/users', data),
      () => mockUserService.create(data)
    );
  },
  
  update: async (id, data) => {
    return handleRequest(
      () => api.put(`/users/${id}`, data),
      () => mockUserService.update(id, data)
    );
  },
  
  delete: async (id) => {
    return handleRequest(
      () => api.delete(`/users/${id}`),
      () => mockUserService.delete(id)
    );
  },
  
  getProfile: async () => {
    return handleRequest(
      () => api.get('/users/profile'),
      async () => ({ data: null }) // Profile từ AuthContext
    );
  },
  
  updateProfile: async (data) => {
    return handleRequest(
      () => api.put('/users/profile', data),
      async () => ({ data })
    );
  },
  
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return handleRequest(
      () => api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      async () => ({ data: { url: URL.createObjectURL(file) } })
    );
  },
  
  getActivityLogs: async (params = {}) => {
    return handleRequest(
      () => api.get('/users/activity-logs', { params }),
      async () => ({ data: [] })
    );
  },
};

import api from './api';
import { mockPackageService } from './mockDataService';

const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true' || true;

const handleRequest = async (apiCall, mockCall) => {
  if (USE_MOCK_DATA) {
    try {
      return await apiCall();
    } catch (error) {
      console.log('Using mock data for packages');
      return await mockCall();
    }
  } else {
    return await apiCall();
  }
};

export const packageService = {
  getAll: async () => {
    return handleRequest(
      () => api.get('/packages'),
      () => mockPackageService.getAll()
    );
  },
  
  getById: async (id) => {
    return handleRequest(
      () => api.get(`/packages/${id}`),
      () => mockPackageService.getById(id)
    );
  },
  
  subscribe: async (packageId) => {
    // Mock subscription
    return handleRequest(
      () => api.post(`/packages/${packageId}/subscribe`),
      async () => {
        const pkg = await mockPackageService.getById(packageId);
        pkg.data.subscriptions = (pkg.data.subscriptions || 0) + 1;
        await mockPackageService.update(packageId, pkg.data);
        return { data: { success: true, message: 'Đăng ký thành công' } };
      }
    );
  },
  
  getSubscriptions: async () => {
    return handleRequest(
      () => api.get('/packages/subscriptions'),
      async () => ({ data: [] })
    );
  },
};





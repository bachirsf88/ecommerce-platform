import api from './api';

const sellerDashboardService = {
  async getDashboard() {
    const response = await api.get('/seller/dashboard');
    return response.data.data ?? null;
  },
};

export default sellerDashboardService;

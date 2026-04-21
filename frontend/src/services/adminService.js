import api from './api';

const compactParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

const adminService = {
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data.data ?? null;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', {
      params: compactParams(params),
    });
    return response.data.data ?? [];
  },

  async getSellers(params = {}) {
    const response = await api.get('/admin/sellers', {
      params: compactParams(params),
    });
    return response.data.data ?? [];
  },

  async approveSeller(id) {
    const response = await api.put(`/admin/sellers/${id}/approve`);
    return response.data.data ?? null;
  },

  async rejectSeller(id) {
    const response = await api.put(`/admin/sellers/${id}/reject`);
    return response.data.data ?? null;
  },

  async getProducts(params = {}) {
    const response = await api.get('/admin/products', {
      params: compactParams(params),
    });
    return response.data.data ?? [];
  },

  async updateProductStatus(id, status) {
    const response = await api.put(`/admin/products/${id}/status`, { status });
    return response.data.data ?? null;
  },

  async getOrders(params = {}) {
    const response = await api.get('/admin/orders', {
      params: compactParams(params),
    });
    return response.data.data ?? [];
  },

  async getReviews(params = {}) {
    const response = await api.get('/admin/reviews', {
      params: compactParams(params),
    });
    return response.data.data ?? [];
  },

  async deleteReview(id) {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data.data ?? null;
  },

  async getWithdrawals(params = {}) {
    const response = await api.get('/admin/withdrawals', {
      params: compactParams(params),
    });
    return response.data.data ?? [];
  },

  async approveWithdrawal(id) {
    const response = await api.put(`/admin/withdrawals/${id}/approve`);
    return response.data.data ?? null;
  },

  async rejectWithdrawal(id) {
    const response = await api.put(`/admin/withdrawals/${id}/reject`);
    return response.data.data ?? null;
  },
};

export default adminService;

import api from './api';

const adminService = {
  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data.data ?? [];
  },

  async getSellers() {
    const response = await api.get('/admin/sellers');
    return response.data.data ?? [];
  },

  async approveSeller(id) {
    const response = await api.put(`/admin/sellers/${id}/approve`);
    return response.data.data ?? null;
  },

  async getProducts() {
    const response = await api.get('/admin/products');
    return response.data.data ?? [];
  },

  async getOrders() {
    const response = await api.get('/admin/orders');
    return response.data.data ?? [];
  },
};

export default adminService;

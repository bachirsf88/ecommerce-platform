import api from './api';

const orderService = {
  async checkout(payload) {
    const response = await api.post('/checkout', {
      full_name: payload.full_name,
      phone: payload.phone,
      country: payload.country,
      state: payload.state,
      municipality: payload.municipality,
      neighborhood: payload.neighborhood,
      street_address: payload.street_address,
      notes: payload.notes,
      shipping_method: payload.shipping_method,
      payment_method: payload.payment_method,
    });

    return response.data.data ?? null;
  },

  async getOrders() {
    const response = await api.get('/orders');
    return response.data.data ?? [];
  },

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data.data ?? null;
  },

  async getSellerOrders() {
    const response = await api.get('/seller/orders');
    return response.data.data ?? [];
  },

  async getSellerOrderById(id) {
    const response = await api.get(`/seller/orders/${id}`);
    return response.data.data ?? null;
  },

  async updateSellerOrderStatus(id, status) {
    const response = await api.put(`/seller/orders/${id}/status`, { status });
    return response.data.data ?? null;
  },
};

export default orderService;

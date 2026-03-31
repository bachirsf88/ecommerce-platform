import api from './api';

const cartService = {
  async getCart() {
    const response = await api.get('/cart');
    return response.data.data ?? null;
  },

  async addToCart(payload) {
    const response = await api.post('/cart/add', {
      product_id: payload.product_id,
      quantity: Number(payload.quantity),
    });

    return response.data.data ?? null;
  },

  async updateCartItem(id, payload) {
    const response = await api.put(`/cart/item/${id}`, payload);
    return response.data.data ?? null;
  },

  async removeCartItem(id) {
    const response = await api.delete(`/cart/item/${id}`);
    return response.data.data ?? null;
  },
};

export default cartService;

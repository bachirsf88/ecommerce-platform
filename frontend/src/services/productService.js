import api from './api';

const normalizeProductPayload = (payload) => ({
  name: payload.name,
  description: payload.description?.trim() || null,
  price: Number(payload.price),
  stock: Number(payload.stock),
  category: payload.category,
  image: payload.image?.trim() || null,
});

const productService = {
  async getProducts() {
    const response = await api.get('/products');
    return response.data.data ?? [];
  },

  async getSellerProducts(sellerId) {
    const response = await api.get('/products');
    const products = response.data.data ?? [];

    return products.filter(
      (product) => String(product?.seller_id) === String(sellerId)
    );
  },

  async searchProducts(keyword) {
    const response = await api.get('/products/search', {
      params: { keyword },
    });

    return response.data.data ?? [];
  },

  async filterProducts(category) {
    const response = await api.get('/products/filter', {
      params: { category },
    });

    return response.data.data ?? [];
  },

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data.data ?? null;
  },

  async createProduct(payload) {
    const response = await api.post('/products', normalizeProductPayload(payload));
    return response.data.data ?? null;
  },

  async updateProduct(id, payload) {
    const response = await api.put(`/products/${id}`, normalizeProductPayload(payload));
    return response.data.data ?? null;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;

import api from './api';

const normalizeProductPayload = (payload) => {
  const formData = new FormData();

  formData.append('name', payload.name);
  formData.append('description', payload.description?.trim() || '');
  formData.append('price', Number(payload.price));
  formData.append('stock', Number(payload.stock));
  formData.append('category', payload.category);
  formData.append('image', payload.image?.trim() || '');

  if (payload.status) {
    formData.append('status', payload.status);
  }

  if (payload.image_file instanceof File) {
    formData.append('image_file', payload.image_file);
  }

  return formData;
};

const productService = {
  async getProducts() {
    const response = await api.get('/products');
    return response.data.data ?? [];
  },

  async getSellerProducts(sellerId) {
    if (sellerId === null || sellerId === undefined || sellerId === '') {
      return [];
    }

    const response = await api.get('/products/filter', {
      params: { seller_id: sellerId },
    });

    return response.data.data ?? [];
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

  async getProductReviews(id) {
    const response = await api.get(`/products/${id}/reviews`);
    return response.data.data ?? null;
  },

  async createProduct(payload) {
    const response = await api.post('/products', normalizeProductPayload(payload), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data ?? null;
  },

  async updateProduct(id, payload) {
    const formData = normalizeProductPayload(payload);
    formData.append('_method', 'PUT');

    const response = await api.post(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data ?? null;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;

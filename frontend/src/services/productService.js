import api from './api';

const compactParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

const normalizeProductPayload = (payload) => {
  const formData = new FormData();

  formData.append('name', payload.name);
  formData.append('description', payload.description?.trim() || '');
  formData.append('price', Number(payload.price));
  formData.append('stock', Number(payload.stock));
  formData.append('category_id', payload.category_id ?? '');

  if (Array.isArray(payload.image_files)) {
    payload.image_files
      .filter((file) => file instanceof File)
      .slice(0, 5)
      .forEach((file) => {
        formData.append('image_files[]', file);
      });
  } else if (payload.image_file instanceof File) {
    formData.append('image_files[]', payload.image_file);
  }

  return formData;
};

const productService = {
  async getProducts(params = {}) {
    const response = await api.get('/products', {
      params: compactParams(params),
    });
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

  async getMyProducts() {
    const response = await api.get('/seller/products');
    return response.data.data ?? [];
  },

  async searchProducts(keyword) {
    const response = await api.get('/products/search', {
      params: { keyword },
    });

    return response.data.data ?? [];
  },

  async filterProducts(params = {}) {
    const response = await api.get('/products/filter', {
      params: compactParams(params),
    });

    return response.data.data ?? [];
  },

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data.data ?? null;
  },

  async getMyProductById(id) {
    const response = await api.get(`/seller/products/${id}`);
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

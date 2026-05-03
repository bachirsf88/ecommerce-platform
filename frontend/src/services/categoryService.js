import api from './api';

const compactParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

const buildCategoryFormData = (payload = {}) => {
  const formData = new FormData();

  formData.append('name', payload.name?.trim() || '');
  formData.append('slug', payload.slug?.trim() || '');
  formData.append('description', payload.description?.trim() || '');
  formData.append('status', payload.status || 'active');

  if (payload.parent_id) {
    formData.append('parent_id', payload.parent_id);
  }

  if (payload.image instanceof File) {
    formData.append('image', payload.image);
  }

  return formData;
};

const categoryService = {
  async getCategories(params = {}) {
    const response = await api.get('/categories', {
      params: compactParams(params),
    });
    return response.data.data ?? [];
  },

  async getCategoryBySlug(slug) {
    const response = await api.get(`/categories/${slug}`);
    return response.data.data ?? null;
  },

  async getCategoryProducts(slug) {
    const response = await api.get(`/categories/${slug}/products`);
    return response.data.data ?? [];
  },

  async getAdminCategories() {
    const response = await api.get('/admin/categories');
    return response.data.data ?? [];
  },

  async createCategory(payload) {
    const response = await api.post('/admin/categories', buildCategoryFormData(payload), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data ?? null;
  },

  async updateCategory(id, payload) {
    const formData = buildCategoryFormData(payload);
    formData.append('_method', 'PUT');

    const response = await api.post(`/admin/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data ?? null;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data.data ?? null;
  },

  async activateCategory(id) {
    const response = await api.patch(`/admin/categories/${id}/activate`);
    return response.data.data ?? null;
  },

  async deactivateCategory(id) {
    const response = await api.patch(`/admin/categories/${id}/deactivate`);
    return response.data.data ?? null;
  },
};

export default categoryService;

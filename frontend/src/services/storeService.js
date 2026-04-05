import api from './api';

const storeService = {
  async getStoreById(id) {
    const response = await api.get(`/stores/${id}`);
    return response.data.data ?? null;
  },

  async getStoreBySellerId(sellerId) {
    const response = await api.get(`/stores/seller/${sellerId}`);
    return response.data.data ?? null;
  },

  async getMyStore() {
    const response = await api.get('/stores/me');
    return response.data.data ?? null;
  },

  async updateMyStore(payload) {
    const formData = new FormData();

    formData.append('store_name', payload.store_name);
    formData.append('description', payload.description || '');
    formData.append('store_address', payload.store_address);
    formData.append('postal_code', payload.postal_code);
    formData.append('contact_email', payload.contact_email || '');
    formData.append('phone_number', payload.phone_number || '');

    if (payload.logo instanceof File) {
      formData.append('logo', payload.logo);
    }

    if (payload.banner instanceof File) {
      formData.append('banner', payload.banner);
    }

    const response = await api.post('/stores/me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data ?? null;
  },
};

export default storeService;

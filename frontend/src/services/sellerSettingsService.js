import api from './api';

const buildProfilePayload = (payload) => {
  const formData = new FormData();

  formData.append('name', payload.name);
  formData.append('bio', payload.bio || '');

  if (payload.profile_image instanceof File) {
    formData.append('profile_image', payload.profile_image);
  }

  Object.entries(payload.notification_preferences ?? {}).forEach(([key, value]) => {
    formData.append(`notification_preferences[${key}]`, value ? '1' : '0');
  });

  return formData;
};

const sellerSettingsService = {
  async getSettings() {
    const response = await api.get('/seller/settings');
    return response.data.data ?? null;
  },

  async updateProfile(payload) {
    const response = await api.post('/seller/settings/profile', buildProfilePayload(payload), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data ?? null;
  },

  async updatePassword(payload) {
    const response = await api.put('/seller/settings/password', payload);
    return response.data.data ?? null;
  },
};

export default sellerSettingsService;

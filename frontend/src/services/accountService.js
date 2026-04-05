import api from './api';

const buildProfilePayload = (payload) => {
  const formData = new FormData();

  formData.append('name', payload.name);
  formData.append('email', payload.email);
  formData.append('phone_number', payload.phone_number || '');

  if (payload.profile_image instanceof File) {
    formData.append('profile_image', payload.profile_image);
  }

  return formData;
};

const accountService = {
  async getAccount() {
    const response = await api.get('/account');
    return response.data.data ?? null;
  },

  async updateProfile(payload) {
    const response = await api.post('/account/profile', buildProfilePayload(payload), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data ?? null;
  },

  async updatePassword(payload) {
    const response = await api.put('/account/password', payload);
    return response.data.data ?? null;
  },
};

export default accountService;

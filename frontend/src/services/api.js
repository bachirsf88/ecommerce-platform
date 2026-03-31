import axios from 'axios';

const TOKEN_KEY = 'token';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authApi = {
  async register(payload) {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  async login(payload) {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async fetchUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export { TOKEN_KEY };
export default api;

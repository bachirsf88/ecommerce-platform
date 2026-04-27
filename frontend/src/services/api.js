import axios from 'axios';

const TOKEN_KEY = 'token';
const DEBUG_API = import.meta.env.DEV || import.meta.env.VITE_API_DEBUG === 'true';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const stripApiSuffix = (value) => value.replace(/\/api$/i, '');

const resolveApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim();

  if (envBaseUrl) {
    return trimTrailingSlash(envBaseUrl);
  }

  if (backendUrl) {
    return `${stripApiSuffix(trimTrailingSlash(backendUrl))}/api`;
  }

  return 'http://127.0.0.1:8000/api';
};

export const API_BASE_URL = resolveApiBaseUrl();
export const resolveRequestUrl = (config = {}) =>
  axios.getUri({
    baseURL: API_BASE_URL,
    ...config,
  });

export const resolveApiOrigin = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost';
  }

  return new URL(API_BASE_URL, window.location.origin).origin;
};

export const getApiErrorMessage = (error, fallbackMessage = 'Request failed.') => {
  const requestUrl = error?.config
    ? resolveRequestUrl(error.config)
    : new URL(
        API_BASE_URL,
        typeof window === 'undefined' ? 'http://localhost' : window.location.origin
      ).toString();
  const responseData = error?.response?.data;
  const responseStatus = error?.response?.status;

  if (typeof responseData === 'string' && responseData.trim()) {
    const trimmedResponseData = responseData.trim();

    if (/<\/?[a-z][\s\S]*>/i.test(trimmedResponseData)) {
      return `Request to ${requestUrl} failed with status ${responseStatus ?? 'unknown'}. The server returned HTML instead of JSON, which usually means the API URL or dev proxy is wrong.`;
    }

    return trimmedResponseData;
  }

  const responseMessage = error?.response?.data?.message;

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  const validationErrors = error?.response?.data?.errors;

  if (validationErrors && typeof validationErrors === 'object') {
    const firstFieldErrors = Object.values(validationErrors).find((value) => Array.isArray(value) && value.length > 0);

    if (firstFieldErrors) {
      return firstFieldErrors[0];
    }
  }

  if (error?.code === 'ERR_NETWORK' || (error?.request && !error?.response)) {
    return `Unable to reach the API at ${requestUrl}. Check that the backend server is running and that your API URL is correct.`;
  }

  if (responseStatus) {
    return `Request to ${requestUrl} failed with status ${responseStatus}.`;
  }

  return fallbackMessage;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (DEBUG_API) {
    console.info(`[api] ${String(config.method || 'GET').toUpperCase()} ${resolveRequestUrl(config)}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (DEBUG_API) {
      console.info(`[api] ${response.status} ${resolveRequestUrl(response.config)}`);
    }

    return response;
  },
  (error) => {
    if (DEBUG_API) {
      console.error('[api] Request failed', {
        url: error?.config ? resolveRequestUrl(error.config) : API_BASE_URL,
        status: error?.response?.status ?? null,
        code: error?.code ?? null,
        data: error?.response?.data ?? null,
      });
    }

    return Promise.reject(error);
  }
);

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

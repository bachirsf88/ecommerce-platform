import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const stripApiSuffix = (value) => value.replace(/\/api$/i, '');
const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const hasHttpProtocol = (value) => /^https?:\/\//i.test(value);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '');
  const apiBaseUrl = trimTrailingSlash(env.VITE_API_BASE_URL || '');
  const backendUrl = stripApiSuffix(
    trimTrailingSlash(
      env.VITE_BACKEND_URL || (hasHttpProtocol(apiBaseUrl) ? apiBaseUrl : 'http://127.0.0.1:8000')
    )
  );
  const proxy = {
    '/api': {
      target: backendUrl,
      changeOrigin: true,
    },
    '/storage': {
      target: backendUrl,
      changeOrigin: true,
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy,
    },
    preview: {
      proxy,
    },
  };
});

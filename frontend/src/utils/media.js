import api from '../services/api';

const API_ORIGIN = new URL(api.defaults.baseURL).origin;

const STORAGE_PREFIXES = ['storage/', '/storage/'];

function hasImageExtension(value) {
  return /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(value);
}

function isRelativeStoragePath(value) {
  const normalizedValue = value.trim();

  if (STORAGE_PREFIXES.some((prefix) => normalizedValue.startsWith(prefix))) {
    return true;
  }

  return normalizedValue.includes('/') && hasImageExtension(normalizedValue);
}

export function isRenderableImageSrc(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const normalizedValue = value.trim();

  return (
    /^(https?:\/\/|data:|blob:|\/)/i.test(normalizedValue) ||
    isRelativeStoragePath(normalizedValue)
  );
}

export function resolveMediaUrl(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value.trim();

  if (!isRenderableImageSrc(normalizedValue)) {
    return normalizedValue;
  }

  if (/^(data:|blob:)/i.test(normalizedValue)) {
    return normalizedValue;
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    try {
      const parsedUrl = new URL(normalizedValue);

      if (parsedUrl.pathname.startsWith('/storage/')) {
        return `${API_ORIGIN}${parsedUrl.pathname}${parsedUrl.search}`;
      }

      return normalizedValue;
    } catch {
      return normalizedValue;
    }
  }

  if (normalizedValue.startsWith('/')) {
    return `${API_ORIGIN}${normalizedValue}`;
  }

  if (normalizedValue.startsWith('storage/')) {
    return `${API_ORIGIN}/${normalizedValue}`;
  }

  return `${API_ORIGIN}/storage/${normalizedValue}`;
}

export function resolveEntityImageUrl(...candidates) {
  const match = candidates.find((candidate) => isRenderableImageSrc(candidate));

  return match ? resolveMediaUrl(match) : '';
}

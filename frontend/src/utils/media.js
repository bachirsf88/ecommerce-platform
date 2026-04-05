const API_ORIGIN = 'http://127.0.0.1:8000';

export function isRenderableImageSrc(value) {
  return typeof value === 'string' && /^(https?:\/\/|data:|blob:|\/)/i.test(value.trim());
}

export function resolveMediaUrl(value) {
  if (!isRenderableImageSrc(value)) {
    return value;
  }

  return value.startsWith('/') ? `${API_ORIGIN}${value}` : value;
}

import { resolveApiOrigin } from '../services/api';

const API_ORIGIN = resolveApiOrigin();

const STORAGE_PREFIXES = ['storage/', '/storage/'];
const IMAGE_EXTENSION_PATTERN = /\.(avif|gif|jpe?g|png|svg|webp)$/i;
const VIDEO_EXTENSION_PATTERN = /\.(mp4|mov|webm|m4v|ogg)$/i;

function hasImageExtension(value) {
  return IMAGE_EXTENSION_PATTERN.test(value);
}

function hasVideoExtension(value) {
  return VIDEO_EXTENSION_PATTERN.test(value);
}

function hasMediaExtension(value) {
  return hasImageExtension(value) || hasVideoExtension(value);
}

function isRelativeStoragePath(value, matcher = hasMediaExtension) {
  const normalizedValue = value.trim();

  if (STORAGE_PREFIXES.some((prefix) => normalizedValue.startsWith(prefix))) {
    return true;
  }

  return normalizedValue.includes('/') && matcher(normalizedValue);
}

export function isRenderableImageSrc(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const normalizedValue = value.trim();

  return (
    /^(https?:\/\/|data:|blob:|\/)/i.test(normalizedValue) ||
    isRelativeStoragePath(normalizedValue, hasImageExtension)
  );
}

export function isRenderableMediaSrc(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const normalizedValue = value.trim();

  return (
    /^(https?:\/\/|data:|blob:|\/)/i.test(normalizedValue) ||
    isRelativeStoragePath(normalizedValue, hasMediaExtension)
  );
}

export function resolveMediaUrl(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value.trim();

  if (!isRenderableMediaSrc(normalizedValue)) {
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
    if (normalizedValue.startsWith('/storage/')) {
      return `${API_ORIGIN}${normalizedValue}`;
    }

    return normalizedValue;
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

function flattenCandidates(candidates) {
  return candidates.flatMap((candidate) => {
    if (Array.isArray(candidate)) {
      return flattenCandidates(candidate);
    }

    return candidate;
  });
}

export function resolveProductPrimaryImage(product, fallbackImage = '') {
  const candidates = flattenCandidates([
    product?.primary_image_url,
    product?.image_url,
    product?.gallery_urls,
    product?.image_urls,
    product?.image,
    product?.images,
  ]);

  return resolveEntityImageUrl(...candidates) || fallbackImage;
}

export function resolveProductGalleryImages(product, fallbackImage = '') {
  const galleryImages = flattenCandidates([
    product?.primary_image_url,
    product?.image_url,
    product?.gallery_urls,
    product?.image_urls,
    product?.image,
    product?.images,
  ])
    .filter((candidate) => isRenderableImageSrc(candidate))
    .map((candidate) => resolveMediaUrl(candidate))
    .filter(Boolean);

  const uniqueImages = [...new Set(galleryImages)];

  if (uniqueImages.length > 0) {
    return uniqueImages;
  }

  return fallbackImage ? [fallbackImage] : [];
}

export function resolveProductVideoUrl(product) {
  const candidates = flattenCandidates([product?.video_url, product?.video]);
  const match = candidates.find((candidate) => isRenderableMediaSrc(candidate));

  return match ? resolveMediaUrl(match) : '';
}

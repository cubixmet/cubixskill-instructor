export type MediaLike =
  | string
  | {
      url?: string | null;
      media_url?: string | null;
      file_url?: string | null;
      relative_path?: string | null;
      file?: string | null;
      thumbnail?: string | null;
      thumbnail_url?: string | null;
      cover_image?: string | null;
      cover_image_url?: string | null;
      image?: string | null;
    }
  | null
  | undefined;

/**
 * Derives the canonical backend origin (e.g. http://localhost:8000) from environment.
 * Never appends /api/v1 to media static routes.
 */
export function getBackendOrigin(): string {
  const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  try {
    const parsed = new URL(rawBase);
    return parsed.origin;
  } catch {
    return 'http://localhost:8000';
  }
}

export const API_BASE_URL = getBackendOrigin();

/**
 * Resolves any backend relative media path into a valid, browser-accessible absolute URL.
 * Handles strings, MediaFile objects, relative paths (/media/...), and already-absolute URLs.
 */
export function resolveMediaUrl(value?: MediaLike): string {
  if (!value) return '';

  let rawPath: string | null | undefined = null;

  if (typeof value === 'string') {
    rawPath = value;
  } else if (typeof value === 'object') {
    rawPath =
      value.url ||
      value.media_url ||
      value.file_url ||
      value.relative_path ||
      value.thumbnail ||
      value.thumbnail_url ||
      value.cover_image ||
      value.cover_image_url ||
      value.image ||
      (typeof value.file === 'string' ? value.file : null);
  }

  if (!rawPath) return '';

  let clean = rawPath.trim();
  if (!clean) return '';

  // Clean Django testserver mock host if present
  if (clean.includes('testserver')) {
    clean = clean.replace(/^https?:\/\/testserver/i, '');
  }

  const backendOrigin = getBackendOrigin();

  // If URL erroneously starts with current window location origin (frontend dev server, e.g. http://localhost:5173),
  // strip the frontend origin so it resolves against backend origin instead.
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const frontendOrigin = window.location.origin;
    if (frontendOrigin !== backendOrigin && clean.startsWith(frontendOrigin)) {
      clean = clean.replace(frontendOrigin, '');
    }
  }

  // Already absolute (http://, https://, blob:, data:)
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('blob:') ||
    clean.startsWith('data:')
  ) {
    return clean;
  }

  // Clean duplicate /media/media/
  clean = clean.replace(/^\/?media\/media\//i, '/media/');

  const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
  return `${backendOrigin}${cleanPath}`;
}

/**
 * Formats bytes into human-readable string (B, KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Formats a creation/upload date string into '25 Aug 2026' style.
 * Returns '-' if the input date value is missing or invalid.
 */
export function formatMediaDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a creation/upload date string into '25 Aug 2026, 1:51 PM' style.
 * Returns '-' if the input date value is missing or invalid.
 */
export function formatMediaDateTime(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

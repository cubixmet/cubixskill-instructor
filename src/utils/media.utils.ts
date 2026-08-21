let origin = 'http://localhost:8000';
try {
  const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  origin = new URL(rawBase).origin;
} catch {
  origin = 'http://localhost:8000';
}

export const API_BASE_URL = origin;

/**
 * Resolves relative backend media paths into absolute URLs.
 * Always resolves against backend origin (http://localhost:8000), never Vite origin (http://localhost:5173).
 */
export function resolveMediaUrl(urlPath?: string | null): string {
  if (!urlPath) return '';
  if (
    urlPath.startsWith('http://') ||
    urlPath.startsWith('https://') ||
    urlPath.startsWith('blob:') ||
    urlPath.startsWith('data:')
  ) {
    return urlPath;
  }
  const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  return `${origin}${cleanPath}`;
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

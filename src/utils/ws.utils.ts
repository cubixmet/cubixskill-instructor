/**
 * Canonical WebSocket URL generator for cubixskill frontend applications.
 * Converts API HTTP base URL (e.g., http://localhost:8000) or window origin
 * into exact ws:// or wss:// WebSocket endpoints.
 */
export function getWebSocketUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const envWsUrl = import.meta.env.VITE_WS_URL;
  
  if (envWsUrl) {
    const wsOrigin = envWsUrl.replace(/\/ws\/.*$/, '').replace(/\/+$/, '');
    return `${wsOrigin}${cleanPath}`;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  let wsOrigin = '';

  try {
    const url = new URL(apiBase);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    wsOrigin = `${protocol}//${url.host}`;
  } catch {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_HOST || 'localhost:8000';
    wsOrigin = `${protocol}//${host}`;
  }

  return `${wsOrigin}${cleanPath}`;
}

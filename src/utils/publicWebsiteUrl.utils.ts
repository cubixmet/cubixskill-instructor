const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RESERVED_WORDS = new Set(['undefined', 'null', 'create', 'new', 'edit', 'settings', 'courses', 'login', 'auth', 'all']);

export function normalizeAcademyId(rawAcademyId?: string | null): string | null {
  if (!rawAcademyId) return null;
  const str = String(rawAcademyId).trim();
  if (!str || RESERVED_WORDS.has(str.toLowerCase())) return null;
  if (!UUID_REGEX.test(str)) return null;
  return str.toLowerCase();
}

export function buildAcademyPublicWebsiteUrl(rawAcademyId?: string | null): string | null {
  const academyId = normalizeAcademyId(rawAcademyId);
  if (!academyId) return null;

  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_STUDENT_APP_URL : undefined;
  const baseUrl = String(envUrl || 'http://localhost:5174').replace(/\/+$/, '');

  if (!baseUrl) return null;

  return `${baseUrl}/${academyId}`;
}

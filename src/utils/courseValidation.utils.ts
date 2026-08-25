const RESERVED_COURSE_SEGMENTS = new Set([
  "create",
  "new",
  "edit",
  "features",
  "discussions",
  "personal",
  "categories",
  "all",
  "undefined",
  "null",
  "overview",
  "curriculum",
  "students",
  "assignments",
  "quizzes",
  "certificates",
  "announcements",
  "live-sessions",
  "reports",
  "settings",
  "fees",
]);

export function isValidUuid(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value.trim());
}

export function isValidCourseId(value: unknown): value is string {
  if (value == null) return false;
  const id = String(value).trim();
  if (!id) return false;

  const normalized = id.toLowerCase();
  if (RESERVED_COURSE_SEGMENTS.has(normalized)) {
    return false;
  }
  return isValidUuid(id);
}

export function normalizeCourseId(value: unknown): string | null {
  if (isValidCourseId(value)) {
    return (value as string).trim();
  }
  return null;
}

export function buildCourseDetailPath(value: unknown): string | null {
  const id = normalizeCourseId(value);
  if (!id) return null;
  return `/courses/${id}`;
}

export function buildCourseEditPath(value: unknown): string | null {
  const id = normalizeCourseId(value);
  if (!id) return null;
  return `/courses/${id}/edit`;
}

export function buildCourseFeaturesPath(value: unknown): string | null {
  const id = normalizeCourseId(value);
  if (!id) return null;
  return `/courses/${id}/features`;
}

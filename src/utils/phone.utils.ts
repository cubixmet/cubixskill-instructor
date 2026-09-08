/**
 * Normalizes Indian phone numbers into standard E.164 format (+91XXXXXXXXXX).
 * 
 * Examples:
 * - "9072910412" -> "+919072910412"
 * - "+919072910412" -> "+919072910412"
 * - "09072910412" -> "+919072910412"
 * - "919072910412" -> "+919072910412"
 * - "+11234567890" -> "+11234567890"
 */
export function normalizeIndianPhone(phone?: string | null): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (!trimmed) return '';

  // Remove spaces, hyphens, and brackets
  const clean = trimmed.replace(/[\s\-()]/g, '');

  if (clean.startsWith('+')) {
    return clean;
  }

  if (clean.startsWith('91') && clean.length === 12) {
    return `+${clean}`;
  }

  if (clean.startsWith('0') && clean.length === 11) {
    return `+91${clean.slice(1)}`;
  }

  if (clean.length === 10) {
    return `+91${clean}`;
  }

  // Fallback for non-standard lengths that don't start with '+'
  return `+91${clean}`;
}

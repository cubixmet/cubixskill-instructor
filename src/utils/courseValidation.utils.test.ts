import { describe, it, expect } from 'vitest';
import { normalizeCourseId, isValidUuid, isValidCourseId } from './courseValidation.utils';

describe('courseValidation.utils', () => {
  it('validates real course UUID properly', () => {
    const uuid = '16b2b938-f69f-47d5-8cc5-8fed40681ea0';
    expect(isValidUuid(uuid)).toBe(true);
    expect(isValidCourseId(uuid)).toBe(true);
    expect(normalizeCourseId(uuid)).toBe('16b2b938-f69f-47d5-8cc5-8fed40681ea0');
  });

  it('rejects reserved keywords and stringified nulls', () => {
    expect(normalizeCourseId('overview')).toBeNull();
    expect(normalizeCourseId('create')).toBeNull();
    expect(normalizeCourseId('undefined')).toBeNull();
    expect(normalizeCourseId('null')).toBeNull();
  });
});

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { courseFeaturesService, CourseFeatureItem } from '../services/courseFeatures.service';
import { isValidCourseId } from '../utils/courseValidation.utils';
import { useAuthStore } from '../store/auth.store';

const ALIAS_MAP: Record<string, string> = {
  FEES: 'FEE_COLLECTION',
  LIVE_SESSIONS: 'LIVE_CLASS',
  ANNOUNCEMENTS: 'COURSE_ANNOUNCEMENT',
  CERTIFICATES: 'COMPLETION_CERTIFICATE',
  DISCUSSIONS: 'COURSE_DISCUSSION',
  ONE_TO_ONE: 'ONE_TO_ONE_SESSION',
};

export function useCourseFeatures(
  courseUuid?: string | null,
  options: { enabled?: boolean } = {}
) {
  const { isAuthenticated } = useAuthStore();
  const validCourseId = isValidCourseId(courseUuid) ? courseUuid.trim() : null;

  const query = useQuery<CourseFeatureItem[]>({
    queryKey: ['course-features', validCourseId],
    queryFn: () => courseFeaturesService.list(validCourseId!),
    enabled: Boolean(validCourseId) && (options.enabled ?? true) && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const features = useMemo(() => query.data || [], [query.data]);
  const isLoading = validCourseId ? query.isLoading : false;
  const error = query.error ? (query.error as any)?.message || 'Failed to load course features' : null;

  const refetch = useCallback(() => {
    if (validCourseId) {
      query.refetch();
    }
  }, [validCourseId, query]);

  const isFeatureEnabled = useCallback(
    (featureCode: string): boolean => {
      if (!validCourseId) return true;
      let codeUpper = (featureCode || '').trim().toUpperCase();
      codeUpper = ALIAS_MAP[codeUpper] || codeUpper;
      if (isLoading) return true;
      if (!features || features.length === 0) return true;
      const found = features.find((f) => f.code.toUpperCase() === codeUpper);
      if (!found) return true;
      return Boolean(found.effective_enabled);
    },
    [validCourseId, isLoading, features]
  );

  return {
    features,
    isLoading,
    error,
    fetchFeatures: refetch,
    refetch,
    isFeatureEnabled,
  };
}

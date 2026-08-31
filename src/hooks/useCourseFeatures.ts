import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { courseFeaturesService, CourseFeatureItem } from '../services/courseFeatures.service';
import { isValidCourseId } from '../utils/courseValidation.utils';
import { useAuthStore } from '../store/auth.store';

export function useCourseFeatures(
  courseUuid?: string | null,
  options: { enabled?: boolean } = {}
) {
  const { isAuthenticated } = useAuthStore();
  const validCourseId = isValidCourseId(courseUuid) ? courseUuid.trim() : null;

  const query = useQuery<CourseFeatureItem[]>({
    queryKey: ['course', validCourseId, 'features'],
    queryFn: () => courseFeaturesService.list(validCourseId!),
    enabled: Boolean(validCourseId) && (options.enabled ?? true) && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const features = query.data || [];
  const isLoading = validCourseId ? query.isLoading : false;
  const error = query.error ? (query.error as any)?.message || 'Failed to load course features' : null;

  const refetch = useCallback(() => {
    if (validCourseId) {
      query.refetch();
    }
  }, [validCourseId, query]);

  const isFeatureEnabled = useCallback(
    (featureCode: string): boolean => {
      if (!features || features.length === 0) return true;
      const codeUpper = featureCode.toUpperCase();
      const found = features.find((f) => f.code.toUpperCase() === codeUpper);
      if (!found) return true;
      return Boolean(found.effective_enabled);
    },
    [features]
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

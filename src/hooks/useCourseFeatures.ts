import { useState, useEffect, useCallback } from 'react';
import { courseFeaturesService, CourseFeatureItem } from '../services/courseFeatures.service';

export function useCourseFeatures(courseUuid?: string) {
  const [features, setFeatures] = useState<CourseFeatureItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    if (!courseUuid) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await courseFeaturesService.list(courseUuid);
      setFeatures(data);
    } catch (err: any) {
      console.error('Failed to load course features:', err);
      setError('Failed to load course features');
    } finally {
      setIsLoading(false);
    }
  }, [courseUuid]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

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

  return { features, isLoading, error, fetchFeatures, isFeatureEnabled };
}

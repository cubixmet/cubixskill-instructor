import { useState, useEffect, useCallback } from 'react';
import { CreditConfig, CreditCalculationResult } from '../types/credit.types';
import {
  DEFAULT_COURSE_CREDIT_CONFIG,
  getCourseCreditConfig,
  calculateCourseCredits,
} from '../services/courseCredit.service';

export const useCourseCredit = () => {
  const [config, setConfig] = useState<CreditConfig>(DEFAULT_COURSE_CREDIT_CONFIG);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const fetched = await getCourseCreditConfig();
        if (isMounted) {
          setConfig(fetched);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load credit rules';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const calculateCredits = useCallback(
    (selectedFeatureIds: string[]): CreditCalculationResult => {
      return calculateCourseCredits(selectedFeatureIds, config);
    },
    [config]
  );

  return {
    creditConfig: config,
    isLoading,
    error,
    calculateCredits,
  };
};

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { creditService, CreditSummaryData } from '../services/credit.service';

export const CREDIT_SUMMARY_QUERY_KEY = ['credits', 'summary'] as const;

export function useCreditSummary(options: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery<CreditSummaryData>({
    queryKey: CREDIT_SUMMARY_QUERY_KEY,
    queryFn: () => creditService.getSummary(),
    enabled: options.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const invalidateSummary = () => {
    queryClient.invalidateQueries({ queryKey: CREDIT_SUMMARY_QUERY_KEY });
  };

  return {
    summary: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidateSummary,
  };
}

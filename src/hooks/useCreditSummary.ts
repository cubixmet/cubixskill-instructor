import { useQuery, useQueryClient } from '@tanstack/react-query';
import { creditService, CreditSummaryData } from '../services/credit.service';
import { useAuthStore } from '../store/auth.store';

export const CREDIT_SUMMARY_QUERY_KEY = ['credits', 'summary'] as const;

export function useCreditSummary(options: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const query = useQuery<CreditSummaryData>({
    queryKey: CREDIT_SUMMARY_QUERY_KEY,
    queryFn: () => creditService.getSummary(),
    enabled: (options.enabled ?? true) && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const invalidateSummary = () => {
    queryClient.invalidateQueries({ queryKey: CREDIT_SUMMARY_QUERY_KEY });
  };

  const updateBalance = (newBalance: string | number) => {
    const balStr = String(newBalance);
    queryClient.setQueryData<CreditSummaryData>(CREDIT_SUMMARY_QUERY_KEY, (old) => {
      if (!old) return old;
      return {
        ...old,
        balance: balStr,
      };
    });
  };

  const applyCreditDebitResult = ({
    previousBalance,
    optimisticDebit,
    serverBalance,
  }: {
    previousBalance?: string | number;
    optimisticDebit?: number;
    serverBalance?: string | number;
  }) => {
    if (serverBalance !== undefined && serverBalance !== null) {
      updateBalance(serverBalance);
      queryClient.invalidateQueries({ queryKey: CREDIT_SUMMARY_QUERY_KEY });
      return;
    }

    if (optimisticDebit !== undefined && optimisticDebit > 0) {
      queryClient.setQueryData<CreditSummaryData>(CREDIT_SUMMARY_QUERY_KEY, (old) => {
        if (!old) return old;
        const currentNum = Number(old.balance || 0);
        const nextNum = Math.max(0, currentNum - optimisticDebit);
        return {
          ...old,
          balance: String(nextNum),
        };
      });
      return;
    }

    if (previousBalance !== undefined && previousBalance !== null) {
      updateBalance(previousBalance);
      queryClient.invalidateQueries({ queryKey: CREDIT_SUMMARY_QUERY_KEY });
    }
  };

  return {
    summary: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidateSummary,
    updateBalance,
    applyCreditDebitResult,
  };
}

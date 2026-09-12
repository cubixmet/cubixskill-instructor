import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Download,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import {
  creditService,
  CreditLedgerItem,
} from '../../../services/credit.service';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { exportToCsv, type CsvColumn } from '../../../utils/export-csv';

import { useCreditSummary } from '../../../hooks/useCreditSummary';

export const CreditsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Backend Summary State via shared TanStack Query hook
  const { summary, isLoading: isSummaryLoading, isError, refetch: loadSummary } = useCreditSummary();
  const summaryError = isError ? 'Unable to load credit balance.' : null;

  // Backend Ledger / Transactions State
  const [transactions, setTransactions] = useState<CreditLedgerItem[]>([]);
  const [isLedgerLoading, setIsLedgerLoading] = useState<boolean>(true);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<CreditLedgerItem | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadLedger = useCallback(async () => {
    setIsLedgerLoading(true);
    setLedgerError(null);
    try {
      const data = await creditService.getTransactions({
        entry_type: historyFilter !== 'all' && ['CREDIT', 'DEBIT'].includes(historyFilter.toUpperCase()) ? historyFilter.toUpperCase() : undefined,
        source_type: historyFilter !== 'all' && !['CREDIT', 'DEBIT'].includes(historyFilter.toUpperCase()) ? historyFilter.toUpperCase() : undefined,
      });
      setTransactions(data.results);
    } catch (err) {
      console.error('Failed to load credit ledger:', err);
      setLedgerError('Unable to load Credit history.');
    } finally {
      setIsLedgerLoading(false);
    }
  }, [historyFilter]);

  // Initial Page Load (Summary & Transactions)
  useEffect(() => {
    loadSummary();
    loadLedger();

    // Check for payment return query params
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      showToast('Payment completed! Refreshing credit balance...');
      window.history.replaceState({}, '', '/credits');
    }
  }, [loadSummary, loadLedger, searchParams]);

  const filteredTransactions = useMemo(() => {
    if (!historySearch.trim()) return transactions;
    const q = historySearch.toLowerCase().trim();
    return transactions.filter(
      (tx) =>
        tx.description.toLowerCase().includes(q) ||
        tx.idempotency_key?.toLowerCase().includes(q) ||
        (tx.reference_id && tx.reference_id.toLowerCase().includes(q))
    );
  }, [transactions, historySearch]);

  const handleDownloadStatement = () => {
    const columns: CsvColumn<CreditLedgerItem>[] = [
      { header: 'Ledger Entry ID', value: (t) => t.id },
      { header: 'Date', value: (t) => new Date(t.occurred_at).toLocaleString() },
      { header: 'Type', value: (t) => t.entry_type },
      { header: 'Source', value: (t) => t.source_type },
      { header: 'Amount', value: (t) => (t.entry_type === 'CREDIT' ? `+${t.amount}` : `-${t.amount}`) },
      { header: 'Balance After', value: (t) => t.balance_after },
      { header: 'Description', value: (t) => t.description },
    ];
    exportToCsv(`credit-statement-${Date.now()}.csv`, filteredTransactions, columns);
    showToast('Statement downloaded successfully.');
  };

  const availableBalanceNum = Math.floor(Number(summary?.balance || 0));

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-left pb-24 sm:pb-16 px-1 sm:px-6 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden min-w-0 font-normal text-xs text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-normal rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Low Balance Warning Banner */}
      {summary?.is_low_balance && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300 font-normal">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              Your credit balance is low ({availableBalanceNum.toLocaleString()} Credits remaining). Purchase credits to prevent service disruption for emails and storage.
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/credits/buy')}
            className="h-11 sm:h-8 min-h-[44px] sm:min-h-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-4 shrink-0 rounded-xl w-full sm:w-auto justify-center"
          >
            Buy Credits
          </Button>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs w-full max-w-full min-w-0 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-base sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Credits &amp; Wallet
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
              Prepaid academy credit balance for email broadcasts, cloud storage, and automated platform services.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadStatement}
              leftIcon={<Download className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#2563EB]" />}
              className="h-11 sm:h-9.5 min-h-[44px] sm:min-h-0 text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] rounded-xl px-3 inline-flex items-center justify-center gap-1.5 border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033]"
            >
              Statement
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => navigate('/credits/buy')}
              leftIcon={<Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" />}
              className="h-11 sm:h-9.5 min-h-[44px] sm:min-h-0 bg-[#2563EB] text-white font-medium text-xs px-4 rounded-xl hover:bg-blue-700 inline-flex items-center justify-center gap-1.5 shadow-2xs"
            >
              Buy Credits
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. SUMMARY METRIC CARDS */}
      {summaryError ? (
        <Card padding="md" className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-center py-6">
          <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mb-2">{summaryError}</p>
          <Button size="sm" onClick={() => loadSummary()} className="h-9 min-h-[42px] text-xs bg-rose-600 text-white hover:bg-rose-700">
            Retry Loading Summary
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-0">
          <Card padding="sm" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs p-3.5 space-y-1 min-w-0">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] text-[11px] font-medium">
              <span className="truncate">Available Credits</span>
              <Wallet className="w-4 h-4 text-[#2563EB] shrink-0" />
            </div>
            {isSummaryLoading ? (
              <div className="h-7 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg w-24"></div>
            ) : (
              <span className="text-sm sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] block truncate break-all">
                {availableBalanceNum.toLocaleString()} {summary?.currency_unit || 'CREDITS'}
              </span>
            )}
            <span className="text-[10px] text-emerald-600 dark:text-[#10B981] font-normal block truncate">
              Available for services
            </span>
          </Card>

          <Card padding="sm" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs p-3.5 space-y-1 min-w-0">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] text-[11px] font-medium">
              <span className="truncate">Used This Month</span>
              <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-[#F87171] shrink-0" />
            </div>
            {isSummaryLoading ? (
              <div className="h-7 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg w-20"></div>
            ) : (
              <span className="text-sm sm:text-xl font-semibold text-rose-600 dark:text-[#F87171] block truncate break-all">
                {Math.floor(Number(summary?.debited_this_month || 0)).toLocaleString()}
              </span>
            )}
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal block truncate">Debited since 1st of month</span>
          </Card>

          <Card padding="sm" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs p-3.5 space-y-1 min-w-0">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] text-[11px] font-medium">
              <span className="truncate">Lifetime Added</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-[#10B981] shrink-0" />
            </div>
            {isSummaryLoading ? (
              <div className="h-7 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg w-24"></div>
            ) : (
              <span className="text-sm sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] block truncate break-all">
                {Math.floor(Number(summary?.total_credited || 0)).toLocaleString()}
              </span>
            )}
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal block truncate">Total added to wallet</span>
          </Card>

          <Card padding="sm" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs p-3.5 space-y-1 min-w-0">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] text-[11px] font-medium">
              <span className="truncate">Lifetime Used</span>
              <CreditCard className="w-4 h-4 text-amber-600 dark:text-[#F59E0B] shrink-0" />
            </div>
            {isSummaryLoading ? (
              <div className="h-7 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg w-24"></div>
            ) : (
              <span className="text-sm sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] block truncate break-all">
                {Math.floor(Number(summary?.total_debited || 0)).toLocaleString()}
              </span>
            )}
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal block truncate">Total debited over time</span>
          </Card>
        </div>
      )}

      {/* 3. THIS MONTH ESTIMATED USAGE & STORAGE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
        {/* Estimated Monthly Feature Usage */}
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl space-y-3 shadow-2xs p-4 min-w-0">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <PieChart className="w-4 h-4 text-[#2563EB] shrink-0" />
              <h2 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                This Month Estimated Usage
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] shrink-0 ml-2">
              Est. Total: {Math.floor(Number(summary?.this_month_estimated_total || 0)).toLocaleString()} Credits
            </span>
          </div>

          <div className="space-y-2 text-xs font-normal">
            {summary?.estimated_breakdown && summary.estimated_breakdown.length > 0 ? (
              summary.estimated_breakdown.map((item) => (
                <div key={item.code} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl min-w-0">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium block truncate">{item.name}</span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate block">{item.detail}</span>
                  </div>
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] shrink-0">
                    {Math.floor(Number(item.credits)).toLocaleString()} Credits
                  </span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">Loading estimated breakdown...</div>
            )}
          </div>
        </Card>

        {/* Storage Breakdown Summary */}
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl space-y-3 shadow-2xs p-4 min-w-0">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <CreditCard className="w-4 h-4 text-amber-600 dark:text-[#F59E0B] shrink-0" />
              <h2 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                Storage Metered Breakdown
              </h2>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-[#F59E0B] shrink-0 ml-2">
              Est. Charge: {Math.floor(Number(summary?.storage_breakdown?.estimated_storage_charge || 0)).toLocaleString()} Credits
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl min-w-0">
              <span className="text-[#64748B] dark:text-[#94A3B8] text-[10px] block truncate">Current Storage</span>
              <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block truncate">{summary?.storage_breakdown?.current_storage_gb || '0.00'} GB</span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl min-w-0">
              <span className="text-[#64748B] dark:text-[#94A3B8] text-[10px] block truncate">Billing Interval</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 block truncate">{summary?.storage_breakdown?.billing_interval_label || '12 Hours'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. CREDIT HISTORY & TRANSACTIONS SECTION */}
      <div className="space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3.5 border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs min-w-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto min-w-0">
            {['all', 'CREDIT', 'DEBIT'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setHistoryFilter(filter)}
                className={`px-3 py-2.5 sm:py-1.5 rounded-xl text-xs font-normal transition-all cursor-pointer whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center ${
                  historyFilter === filter
                    ? 'bg-[#2563EB] text-white font-medium shadow-2xs'
                    : 'bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-200'
                }`}
              >
                {filter === 'all' ? 'All Transactions' : filter === 'CREDIT' ? 'Credits Added' : 'Credits Used'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search ledger description..."
              className="w-full h-11 sm:h-9 pl-9 pr-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] min-h-[44px] sm:min-h-0"
            />
          </div>
        </div>

        {/* Desktop Transactions Table */}
        <div className="hidden md:block bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl overflow-hidden shadow-2xs">
          {isLedgerLoading ? (
            <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">Loading credit history...</div>
          ) : ledgerError ? (
            <div className="p-8 text-center text-xs text-rose-600 font-normal space-y-2">
              <p>{ledgerError}</p>
              <Button size="sm" onClick={loadLedger} className="h-8 text-xs bg-rose-600 text-white">Retry</Button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">No credit transactions match query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans font-normal min-w-[750px]">
                <thead className="bg-slate-50 dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] text-[#64748B] dark:text-[#94A3B8] font-semibold text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Balance After</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263244]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-[#172033]/50 transition-colors">
                      <td className="py-3 px-4 text-[#64748B] dark:text-[#94A3B8] font-normal">
                        {new Date(tx.occurred_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-normal">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 w-fit ${
                            tx.entry_type === 'CREDIT'
                              ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-700 dark:text-[#34D399] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)]'
                              : 'bg-rose-50 dark:bg-[rgba(239,68,68,0.10)] text-rose-700 dark:text-[#F87171] border border-rose-200 dark:border-[rgba(248,113,113,0.25)]'
                          }`}
                        >
                          {tx.entry_type === 'CREDIT' ? '+' : '-'} {tx.entry_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-normal text-[#475569] dark:text-[#CBD5E1]">
                        {tx.source_type}
                      </td>
                      <td className="py-3 px-4 text-[#0F172A] dark:text-[#F8FAFC] font-medium">
                        {tx.description}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${tx.entry_type === 'CREDIT' ? 'text-emerald-600 dark:text-[#10B981]' : 'text-rose-600 dark:text-[#F87171]'}`}>
                        {tx.entry_type === 'CREDIT' ? `+${Math.floor(Number(tx.amount)).toLocaleString()}` : `-${Math.floor(Number(tx.amount)).toLocaleString()}`}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                        {Math.floor(Number(tx.balance_after)).toLocaleString()} Credits
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTx(tx)}
                          className="h-8 text-[11px] px-2.5 font-medium border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Transactions Stacked Cards */}
        <div className="md:hidden space-y-3 min-w-0 font-normal">
          {isLedgerLoading ? (
            <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">Loading credit transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] text-[#64748B] dark:text-[#94A3B8]">
              No transactions found.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-2.5 text-xs min-w-0">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-2 gap-2 min-w-0">
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate">
                    {new Date(tx.occurred_at).toLocaleString()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                      tx.entry_type === 'CREDIT'
                        ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-700 dark:text-[#34D399] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)]'
                        : 'bg-rose-50 dark:bg-[rgba(239,68,68,0.10)] text-rose-700 dark:text-[#F87171] border border-rose-200 dark:border-[rgba(248,113,113,0.25)]'
                    }`}
                  >
                    {tx.entry_type === 'CREDIT' ? '+' : '-'} {tx.entry_type}
                  </span>
                </div>

                <div className="min-w-0 space-y-1">
                  <h4 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">{tx.description}</h4>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Source: {tx.source_type}</p>
                </div>

                <div className="bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Amount</span>
                    <span className={`font-semibold ${tx.entry_type === 'CREDIT' ? 'text-emerald-600 dark:text-[#10B981]' : 'text-rose-600 dark:text-[#F87171]'}`}>
                      {tx.entry_type === 'CREDIT' ? `+${Math.floor(Number(tx.amount)).toLocaleString()}` : `-${Math.floor(Number(tx.amount)).toLocaleString()}`} Credits
                    </span>
                  </div>
                  <div className="flex justify-between text-[#475569] dark:text-[#CBD5E1]">
                    <span>Balance After</span>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{Math.floor(Number(tx.balance_after)).toLocaleString()} Credits</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedTx(tx)}
                  className="w-full h-11 min-h-[44px] rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1] font-medium justify-center"
                >
                  View Details
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* TRANSACTION DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        title="Credit Ledger Details"
        subtitle={`Transaction ID: ${selectedTx?.id || ''}`}
        maxWidth="md"
      >
        {selectedTx && (
          <div className="space-y-4 font-sans text-xs text-left font-normal min-w-0">
            <div className="p-3.5 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl space-y-2 min-w-0">
              <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8] min-w-0 gap-2">
                <span className="shrink-0">Description:</span>
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium truncate">{selectedTx.description}</span>
              </div>
              <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span>Entry Type:</span>
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">{selectedTx.entry_type}</span>
              </div>
              <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span>Source Type:</span>
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">{selectedTx.source_type}</span>
              </div>
              <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span>Credits:</span>
                <span className={`font-medium ${selectedTx.entry_type === 'CREDIT' ? 'text-emerald-600 dark:text-[#10B981]' : 'text-rose-600 dark:text-[#F87171]'}`}>
                  {selectedTx.entry_type === 'CREDIT' ? `+${selectedTx.amount}` : `-${selectedTx.amount}`}
                </span>
              </div>
              <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span>Balance Before / After:</span>
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">
                  {selectedTx.balance_before} → {selectedTx.balance_after}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
              <Button onClick={() => setSelectedTx(null)} className="h-11 sm:h-9 min-h-[44px] sm:min-h-0 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium px-5 rounded-xl w-full sm:w-auto justify-center">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

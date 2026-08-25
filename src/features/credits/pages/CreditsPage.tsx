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
  CreditSummaryData,
  CreditLedgerItem,
  CreditUsageItem,
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

  // Backend Usage Breakdown State
  const [usageItems, setUsageItems] = useState<CreditUsageItem[]>([]);
  const [isUsageLoading, setIsUsageLoading] = useState<boolean>(true);

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

  const loadUsage = useCallback(async () => {
    setIsUsageLoading(true);
    try {
      const res = await creditService.getUsage();
      setUsageItems(res.usage || []);
    } catch (err) {
      console.error('Failed to load credit usage:', err);
    } finally {
      setIsUsageLoading(false);
    }
  }, []);

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

  // Initial Page Load (Summary, Usage, Transactions - NO Packages request on page load)
  useEffect(() => {
    loadSummary();
    loadUsage();
    loadLedger();

    // Check for payment return query params
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      showToast('Payment completed! Refreshing credit balance...');
      window.history.replaceState({}, '', '/credits');
    }
  }, [loadSummary, loadUsage, loadLedger, searchParams]);

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
    <div className="space-y-4 sm:space-y-6 font-sans text-left pb-24 sm:pb-16 px-2.5 sm:px-6 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden min-w-0 font-normal">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-normal rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Low Balance Warning Banner */}
      {summary?.is_low_balance && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300 font-normal">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Your credit balance is low ({availableBalanceNum.toLocaleString()} Credits remaining). Purchase credits to prevent service disruption for emails and storage.
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/credits/buy')}
            className="h-8 bg-amber-600 hover:bg-amber-700 text-white text-xs font-normal px-3 shrink-0 rounded-xl"
          >
            Buy Credits
          </Button>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] shadow-2xs w-full max-w-full min-w-0 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              Credits &amp; Wallet
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Prepaid academy credit balance for email broadcasts, cloud storage, and automated platform services.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadStatement}
              leftIcon={<Download className="w-3.5 h-3.5 text-[#2563EB]" />}
              className="h-[38px] min-h-[38px] text-[11.5px] sm:text-xs font-normal text-slate-700 dark:text-slate-300 rounded-xl px-3 inline-flex items-center justify-center gap-1.5 border-slate-200 dark:border-[#334155]"
            >
              Statement
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => navigate('/credits/buy')}
              leftIcon={<Plus className="w-3.5 h-3.5 text-white" />}
              className="h-[38px] min-h-[38px] bg-[#2563EB] text-white font-normal text-[11.5px] sm:text-xs px-3.5 rounded-xl hover:bg-blue-700 inline-flex items-center justify-center gap-1.5 shadow-2xs"
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
          <Button size="sm" onClick={() => loadSummary()} className="h-8 text-xs bg-rose-600 text-white hover:bg-rose-700">
            Retry Loading Summary
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card padding="sm" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10.5px] font-normal">
              <span>Available Credits</span>
              <Wallet className="w-4 h-4 text-[#2563EB]" />
            </div>
            {isSummaryLoading ? (
              <div className="h-7 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg w-24"></div>
            ) : (
              <span className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white block">
                {availableBalanceNum.toLocaleString()} {summary?.currency_unit || 'CREDITS'}
              </span>
            )}
            <span className="text-[10px] text-emerald-600 font-normal block truncate">
              Available for services
            </span>
          </Card>

          <Card padding="sm" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10.5px] font-normal">
              <span>Used This Month</span>
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            </div>
            {isSummaryLoading ? (
              <div className="h-7 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg w-20"></div>
            ) : (
              <span className="text-base sm:text-xl font-semibold text-rose-600 block">
                {Math.floor(Number(summary?.debited_this_month || 0)).toLocaleString()}
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-normal block truncate">Debited since 1st of month</span>
          </Card>

          <Card padding="sm" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10.5px] font-normal">
              <span>Lifetime Added</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
            {isSummaryLoading ? (
              <div className="h-7 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg w-24"></div>
            ) : (
              <span className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white block">
                {Math.floor(Number(summary?.total_credited || 0)).toLocaleString()}
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-normal block truncate">Total added to wallet</span>
          </Card>

          <Card padding="sm" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10.5px] font-normal">
              <span>Lifetime Used</span>
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            {isSummaryLoading ? (
              <div className="h-7 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg w-24"></div>
            ) : (
              <span className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white block">
                {Math.floor(Number(summary?.total_debited || 0)).toLocaleString()}
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-normal block truncate">Total debited over time</span>
          </Card>
        </div>
      )}

      {/* 3. USAGE THIS MONTH SECTION */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-3 shadow-2xs p-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-2">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              Usage This Month
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-normal">Aggregated service consumption</span>
        </div>

        {isUsageLoading ? (
          <div className="py-4 text-center text-xs text-slate-400 font-normal">Loading usage breakdown...</div>
        ) : usageItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 font-normal">No credit usage recorded this month.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {usageItems.map((item) => (
              <div key={item.source_type} className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl space-y-1">
                <div className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                  {item.label}
                </div>
                <p className="text-slate-900 dark:text-white font-semibold text-base">
                  {Math.floor(Number(item.credits_used)).toLocaleString()} Credits
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. CREDIT HISTORY & TRANSACTIONS SECTION */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3.5 border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {['all', 'CREDIT', 'DEBIT'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setHistoryFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-normal transition-all cursor-pointer whitespace-nowrap ${
                  historyFilter === filter
                    ? 'bg-[#2563EB] text-white font-medium shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {filter === 'all' ? 'All Transactions' : filter === 'CREDIT' ? 'Credits Added' : 'Credits Used'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search ledger description..."
              className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs font-normal text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl overflow-hidden shadow-2xs">
          {isLedgerLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 font-normal">Loading credit history...</div>
          ) : ledgerError ? (
            <div className="p-8 text-center text-xs text-rose-600 font-normal space-y-2">
              <p>{ledgerError}</p>
              <Button size="sm" onClick={loadLedger} className="h-7 text-xs bg-rose-600 text-white">Retry</Button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-normal">No credit transactions yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans font-normal">
                <thead className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263244] text-slate-600 dark:text-slate-400 font-semibold">
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
                <tbody className="divide-y divide-slate-100 dark:divide-[#263244]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-[#172033]/50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-normal">
                        {new Date(tx.occurred_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-normal">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            tx.entry_type === 'CREDIT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {tx.entry_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-normal text-slate-700 dark:text-slate-300">
                        {tx.source_type}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">
                        {tx.description}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${tx.entry_type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.entry_type === 'CREDIT' ? `+${Math.floor(Number(tx.amount)).toLocaleString()}` : `-${Math.floor(Number(tx.amount)).toLocaleString()}`}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {Math.floor(Number(tx.balance_after)).toLocaleString()} Credits
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTx(tx)}
                          className="h-7 text-[10px] px-2.5 font-normal border-slate-200 dark:border-[#334155]"
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
          <div className="space-y-4 font-sans text-xs text-left font-normal">
            <div className="p-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl space-y-1.5">
              <div className="flex justify-between text-slate-500 font-normal">
                <span>Description:</span>
                <span className="text-slate-900 dark:text-white font-medium">{selectedTx.description}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-normal">
                <span>Entry Type:</span>
                <span className="text-slate-900 dark:text-white font-medium">{selectedTx.entry_type}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-normal">
                <span>Source Type:</span>
                <span className="text-slate-900 dark:text-white font-medium">{selectedTx.source_type}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-normal">
                <span>Credits:</span>
                <span className={`font-medium ${selectedTx.entry_type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedTx.entry_type === 'CREDIT' ? `+${selectedTx.amount}` : `-${selectedTx.amount}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 font-normal">
                <span>Balance Before / After:</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {selectedTx.balance_before} → {selectedTx.balance_after}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-[#263244]">
              <Button onClick={() => setSelectedTx(null)} className="h-9 bg-[#2563EB] text-white text-xs font-normal px-4">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

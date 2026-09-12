import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import {
  paymentSettingsService,
  type PaymentTransactionItem,
} from '../../../services/paymentSettings.service';
import { PaymentNavigationTabs } from '../components/PaymentNavigationTabs';

export const TransactionsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modeFilter, setModeFilter] = useState<string>('ALL');

  // Details Modal
  const [selectedTx, setSelectedTx] = useState<PaymentTransactionItem | null>(null);

  // Refund Modal
  const [refundTx, setRefundTx] = useState<PaymentTransactionItem | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentSettingsService.getTransactions();
      setTransactions(data);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTx) return;
    const amt = parseFloat(refundAmount);
    if (!amt || amt <= 0) {
      alert('Enter a valid refund amount.');
      return;
    }

    try {
      setRefunding(true);
      await paymentSettingsService.refundTransaction(refundTx.uuid, amt, refundReason);
      alert('Refund processed successfully!');
      setRefundTx(null);
      loadTransactions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process refund.');
    } finally {
      setRefunding(false);
    }
  };

  const filtered = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (tx.payer_email || '').toLowerCase().includes(q) ||
      (tx.course_title || '').toLowerCase().includes(q) ||
      (tx.gateway_payment_id || '').toLowerCase().includes(q) ||
      (tx.gateway_order_id || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const matchesMode =
      modeFilter === 'ALL' ||
      (modeFilter === 'DIRECT' && tx.payment_mode === 'ACADEMY_RAZORPAY') ||
      (modeFilter === 'CUBIXSKILL' && tx.payment_mode === 'CUBIXSKILL_RAZORPAY');

    return matchesSearch && matchesStatus && matchesMode;
  });

  return (
    <div className="p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-6 text-left font-sans min-w-0 overflow-x-hidden">
      {/* NAVIGATION TABS */}
      <PaymentNavigationTabs />

      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
          Payment Transactions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] font-normal mt-1 leading-relaxed">
          Track and manage student course payments for your academy.
        </p>
      </div>

      {/* FILTER BAR (Stacked on mobile) */}
      <div className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-[#263244] flex flex-col sm:grid sm:grid-cols-3 gap-3 shadow-2xs">
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 dark:text-[#64748B] shrink-0" />
          <input
            type="text"
            placeholder="Search student, course, payment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 min-h-[44px] pl-10 pr-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div className="w-full">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Paid / Success</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="w-full">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="DIRECT">Direct (Academy Razorpay)</option>
            <option value="CUBIXSKILL">CubixSkill Payments</option>
          </select>
        </div>
      </div>

      {/* RESULT SUMMARY */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] font-medium px-1">
        <span>Showing {filtered.length} of {transactions.length} transactions</span>
      </div>

      {/* MOBILE TRANSACTIONS STACKED CARDS (Below md breakpoint - 1 card per row) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244]">
            Loading transactions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244]">
            No matching transaction records found.
          </div>
        ) : (
          filtered.map((tx) => (
            <div key={tx.id || tx.uuid} className="p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-3 text-xs text-left shadow-2xs w-full max-w-full min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] break-all block">
                    {tx.payer_email || 'Student'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">
                    {new Date(tx.paid_at || tx.initiated_at || Date.now()).toLocaleString()}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                    tx.status === 'SUCCESS'
                      ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] text-emerald-700 dark:text-[#6EE7B7]'
                      : tx.status === 'REFUNDED'
                      ? 'bg-slate-100 dark:bg-[#172033] text-slate-600 dark:text-[#94A3B8]'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {tx.status}
                </span>
              </div>

              <div className="text-slate-600 dark:text-[#CBD5E1] text-[11px] break-words">
                Course: <strong>{tx.course_title || 'Course Purchase'}</strong>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#94A3B8] pt-2 border-t border-slate-100 dark:border-[#263244]">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-[#64748B] block">Payment Ref</span>
                  <span className="font-mono text-slate-900 dark:text-[#F8FAFC] break-all">
                    {tx.gateway_payment_id || (tx.uuid ? tx.uuid.slice(0, 8) : 'N/A')}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 dark:text-[#64748B] block">Amount</span>
                  <strong className="text-slate-900 dark:text-[#F8FAFC] font-bold text-xs">
                    ₹{Number(tx.amount || 0).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#263244] grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTx(tx)}
                  className="h-[44px] min-h-[44px] w-full text-xs font-semibold border border-slate-200 dark:border-[#334155] rounded-xl hover:bg-slate-100 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] cursor-pointer inline-flex items-center justify-center"
                >
                  View Details
                </button>
                {tx.status === 'SUCCESS' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRefundTx(tx);
                      setRefundAmount(String(tx.amount));
                    }}
                    className="h-[44px] min-h-[44px] w-full text-xs font-semibold border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-[#DC2626] dark:text-[#F87171] cursor-pointer inline-flex items-center justify-center"
                  >
                    Refund
                  </button>
                ) : (
                  <div className="h-[44px] min-h-[44px] flex items-center justify-center text-[11px] text-slate-400">
                    No actions
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TRANSACTIONS TABLE (md and above) */}
      <div className="hidden md:block bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#263244] bg-slate-50 dark:bg-[#0F172A] text-slate-500 dark:text-[#94A3B8] font-medium text-[11px] uppercase tracking-wider">
              <th className="p-3.5 pl-4">Student</th>
              <th className="p-3.5">Course</th>
              <th className="p-3.5">Payment ID</th>
              <th className="p-3.5">Amount</th>
              <th className="p-3.5">Mode</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#263244]">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-[#94A3B8]">
                  Loading transactions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-[#94A3B8]">
                  No matching transaction records found.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id || tx.uuid} className="hover:bg-slate-50/50 dark:hover:bg-[#172033]/50 transition-colors">
                  <td className="p-3.5 pl-4 font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    {tx.payer_email || 'Student'}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-[#CBD5E1]">
                    {tx.course_title || 'Course Purchase'}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-900 dark:text-[#F8FAFC]">
                    {tx.gateway_payment_id || (tx.uuid ? tx.uuid.slice(0, 8) : String(tx.id || 'N/A'))}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    ₹{Number(tx.amount || 0).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-[#CBD5E1]">
                      {tx.payment_mode === 'ACADEMY_RAZORPAY' ? 'Direct' : 'CubixSkill'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        tx.status === 'SUCCESS'
                          ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] text-emerald-700 dark:text-[#6EE7B7]'
                          : tx.status === 'REFUNDED'
                          ? 'bg-slate-100 dark:bg-[#172033] text-slate-600 dark:text-[#94A3B8]'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-[#94A3B8]">
                    {new Date(tx.paid_at || tx.initiated_at || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right pr-4 space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTx(tx)}
                      className="px-2.5 py-1 text-[11px] font-medium border border-slate-200 dark:border-[#334155] rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] cursor-pointer"
                    >
                      View Details
                    </button>
                    {tx.status === 'SUCCESS' && (
                      <button
                        type="button"
                        onClick={() => {
                          setRefundTx(tx);
                          setRefundAmount(String(tx.amount));
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-[#DC2626] dark:text-[#F87171] cursor-pointer"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TRANSACTION DETAILS MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl text-left font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Transaction Details</h3>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Student</span>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] break-all">{selectedTx.payer_email || 'Student'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Course</span>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] break-words">{selectedTx.course_title || 'Course'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Internal TX ID</span>
                <span className="font-mono text-slate-900 dark:text-[#F8FAFC] break-all">{selectedTx.uuid}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Razorpay Payment ID</span>
                <span className="font-mono text-slate-900 dark:text-[#F8FAFC] break-all">{selectedTx.gateway_payment_id || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Razorpay Order ID</span>
                <span className="font-mono text-slate-900 dark:text-[#F8FAFC] break-all">{selectedTx.gateway_order_id || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Gross Amount</span>
                <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">₹{selectedTx.amount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Payment Mode</span>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{selectedTx.payment_mode}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Paid Date</span>
                <span className="text-slate-900 dark:text-[#F8FAFC]">
                  {new Date(selectedTx.paid_at || selectedTx.initiated_at || Date.now()).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="h-[44px] min-h-[44px] px-5 bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {refundTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form onSubmit={handleRefundSubmit} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl text-left font-sans">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Refund Payment</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Payment ID: <span className="font-mono font-semibold break-all">{refundTx.gateway_payment_id || refundTx.uuid}</span>
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Refund Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Reason</label>
                <input
                  type="text"
                  placeholder="Reason for refund..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefundTx(null)}
                className="h-[44px] min-h-[44px] px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#263244] text-slate-700 dark:text-[#CBD5E1] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={refunding}
                className="h-[44px] min-h-[44px] px-5 rounded-xl text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-50 cursor-pointer"
              >
                {refunding ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

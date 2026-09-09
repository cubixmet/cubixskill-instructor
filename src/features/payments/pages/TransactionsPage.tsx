import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  X,
} from 'lucide-react';
import {
  paymentSettingsService,
  type PaymentTransactionItem,
} from '../../../services/paymentSettings.service';

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left font-sans min-w-0">
      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC]">
          Transactions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] font-normal mt-1">
          Track all student course payments for your academy.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-[14px] border border-slate-200 dark:border-[#263244] grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-2xs">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, course, payment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Paid / Success</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="DIRECT">Direct (Academy Razorpay)</option>
            <option value="CUBIXSKILL">CubixSkill Payments</option>
          </select>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white dark:bg-[#111827] rounded-[14px] border border-slate-200 dark:border-[#263244] overflow-x-auto shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#263244] bg-slate-50 dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-medium">
              <th className="p-3.5">Student</th>
              <th className="p-3.5">Course</th>
              <th className="p-3.5">Payment ID</th>
              <th className="p-3.5">Amount</th>
              <th className="p-3.5">Mode</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-right">Actions</th>
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
                <tr key={tx.id || tx.uuid} className="hover:bg-slate-50/50 dark:hover:bg-[#172033]/50">
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    {tx.payer_email || 'Student'}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-[#CBD5E1]">
                    {tx.course_title || 'Course Purchase'}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-900 dark:text-[#F8FAFC]">
                    {tx.gateway_payment_id || (tx.uuid ? tx.uuid.slice(0, 8) : String(tx.id || 'N/A'))}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    ₹{Number(tx.amount).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-[#CBD5E1]">
                      {tx.payment_mode === 'ACADEMY_RAZORPAY' ? 'Direct' : 'CubixSkill'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
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
                    {new Date(tx.paid_at || tx.initiated_at).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] max-w-md w-full p-6 space-y-4 shadow-xl text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">Transaction Details</h3>
              <button type="button" onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Student</span>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{selectedTx.payer_email || 'Student'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Course</span>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{selectedTx.course_title || 'Course'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Internal Transaction ID</span>
                <span className="font-mono text-slate-900 dark:text-[#F8FAFC]">{selectedTx.uuid}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Razorpay Payment ID</span>
                <span className="font-mono text-slate-900 dark:text-[#F8FAFC]">{selectedTx.gateway_payment_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Razorpay Order ID</span>
                <span className="font-mono text-slate-900 dark:text-[#F8FAFC]">{selectedTx.gateway_order_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Gross Amount</span>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">₹{selectedTx.amount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Payment Mode</span>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{selectedTx.payment_mode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Paid Date</span>
                <span className="text-slate-900 dark:text-[#F8FAFC]">
                  {new Date(selectedTx.paid_at || selectedTx.initiated_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {refundTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleRefundSubmit} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] max-w-md w-full p-6 space-y-4 shadow-xl text-left">
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">Refund Payment</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Payment ID: <span className="font-mono font-semibold">{refundTx.gateway_payment_id || refundTx.uuid}</span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Refund Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Reason</label>
                <input
                  type="text"
                  placeholder="Reason for refund..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefundTx(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#263244] text-slate-700 dark:text-[#CBD5E1]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={refunding}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
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

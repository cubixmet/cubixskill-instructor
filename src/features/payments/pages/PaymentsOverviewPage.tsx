import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Settings,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import {
  paymentSettingsService,
  type PaymentSettingsData,
  type PaymentTransactionItem,
} from '../../../services/paymentSettings.service';
import { PaymentNavigationTabs } from '../components/PaymentNavigationTabs';

export const PaymentsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PaymentSettingsData | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>([]);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      const [settingsRes, txRes] = await Promise.all([
        paymentSettingsService.getPaymentSettings().catch(() => null),
        paymentSettingsService.getTransactions().catch(() => []),
      ]);
      setSettings(settingsRes);
      setTransactions(Array.isArray(txRes) ? txRes : []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const totalSales = safeTransactions.filter((t) => t.status === 'SUCCESS').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const successfulCount = safeTransactions.filter((t) => t.status === 'SUCCESS').length;
  const pendingCount = safeTransactions.filter((t) => t.status === 'PENDING' || t.status === 'CREATED').length;
  const refundedCount = safeTransactions.filter((t) => t.status === 'REFUNDED').length;

  const isMode1 = settings?.payment_mode === 'ACADEMY_RAZORPAY';

  return (
    <div className="p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-6 text-left font-sans min-w-0 overflow-x-hidden">
      {/* NAVIGATION TABS */}
      <PaymentNavigationTabs />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              Payments Overview
            </h1>
            {settings && (
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                  isMode1
                    ? 'bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/50'
                    : 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] text-emerald-700 dark:text-[#6EE7B7] border border-emerald-200 dark:border-emerald-900/50'
                }`}
              >
                {isMode1 ? 'Academy Razorpay' : 'CubixSkill Payments'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] font-normal leading-relaxed">
            View your academy's payment activity, sales revenue, and settlement status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/settings/payments')}
          className="h-[44px] min-h-[44px] w-full sm:w-auto px-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs rounded-xl inline-flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          <Settings className="w-4 h-4" />
          <span>Payment Settings</span>
        </button>
      </div>

      {/* MODE NOTICE BANNER */}
      {isMode1 ? (
        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[rgba(37,99,235,0.08)] border border-blue-200 dark:border-blue-500/20 text-xs text-[#2563EB] dark:text-[#60A5FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CreditCard className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">Payments are processed directly through your connected Razorpay account.</span>
          </div>
          <Link to="/settings/payments" className="font-semibold underline shrink-0 min-h-[44px] flex items-center">
            Manage Config
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-[rgba(16,185,129,0.08)] border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-[#6EE7B7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">CubixSkill Payments active. Eligible balances are settled to your configured payout method.</span>
          </div>
          <Link to="/payments/settlements" className="font-semibold underline shrink-0 min-h-[44px] flex items-center">
            View Settlements
          </Link>
        </div>
      )}

      {/* SUMMARY CARDS (1 col on mobile 320px+) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#263244] space-y-1 shadow-2xs min-w-0">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Total Sales</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] break-all">
            {loading ? '...' : `₹${totalSales.toLocaleString()}`}
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#263244] space-y-1 shadow-2xs min-w-0">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Successful Payments</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-[#6EE7B7]">
            {loading ? '...' : successfulCount}
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#263244] space-y-1 shadow-2xs min-w-0">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Pending Payments</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {loading ? '...' : pendingCount}
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#263244] space-y-1 shadow-2xs min-w-0">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Refunded Payments</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-600 dark:text-[#CBD5E1]">
            {loading ? '...' : refundedCount}
          </span>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Recent Transactions</h2>
          <Link
            to="/payments/transactions"
            className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline inline-flex items-center gap-1 min-h-[44px] px-2"
          >
            <span>View All Transactions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* MOBILE STACKED CARDS (Below md) */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244]">
              Loading payment activity...
            </div>
          ) : safeTransactions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244]">
              No payments yet. Student payments will appear here once transactions are created.
            </div>
          ) : (
            safeTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id || tx.uuid || Math.random()} className="p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-2.5 text-xs text-left shadow-2xs w-full max-w-full min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] break-all">
                    {tx.payer_email || 'Student'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
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
                  {tx.course_title || 'Course Purchase'}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#94A3B8] pt-2 border-t border-slate-100 dark:border-[#263244]">
                  <span className="font-mono break-all">{tx.gateway_payment_id || (tx.uuid ? tx.uuid.slice(0, 8) : 'N/A')}</span>
                  <strong className="text-slate-900 dark:text-[#F8FAFC] font-bold text-xs">
                    ₹{Number(tx.amount || 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE (md and above) */}
        <div className="hidden md:block bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#263244] bg-slate-50 dark:bg-[#0F172A] text-slate-500 dark:text-[#94A3B8] font-medium text-[11px] uppercase tracking-wider">
                <th className="p-3.5 pl-4">Student</th>
                <th className="p-3.5">Course</th>
                <th className="p-3.5">Payment ID</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#263244]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-[#94A3B8]">
                    Loading payment activity...
                  </td>
                </tr>
              ) : safeTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-[#94A3B8]">
                    No payments yet. Student payments will appear here once transactions are created.
                  </td>
                </tr>
              ) : (
                safeTransactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id || tx.uuid || Math.random()} className="hover:bg-slate-50/50 dark:hover:bg-[#172033]/50 transition-colors">
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
                    <td className="p-3.5 pr-4 text-slate-500 dark:text-[#94A3B8]">
                      {new Date(tx.paid_at || tx.initiated_at || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, CreditCard} from 'lucide-react';
import {
  paymentSettingsService,
  type PaymentSettingsData,
  type AcademySettlementItem,
} from '../../../services/paymentSettings.service';
import { PaymentNavigationTabs } from '../components/PaymentNavigationTabs';

export const SettlementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PaymentSettingsData | null>(null);
  const [settlements, setSettlements] = useState<AcademySettlementItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsRes, settlementsRes] = await Promise.all([
        paymentSettingsService.getPaymentSettings().catch(() => null),
        paymentSettingsService.getSettlements().catch(() => []),
      ]);
      setSettings(settingsRes);
      setSettlements(Array.isArray(settlementsRes) ? settlementsRes : []);
    } catch {
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isMode1 = settings?.payment_mode === 'ACADEMY_RAZORPAY';

  const grossSales = settlements.reduce((acc, s) => acc + Number(s.gross_amount || 0), 0);
  const totalFees = settlements.reduce((acc, s) => acc + Number(s.platform_fee || 0) + Number(s.gateway_fee || 0), 0);
  const totalSettled = settlements.filter((s) => s.status === 'PAID').reduce((acc, s) => acc + Number(s.net_amount || 0), 0);
  const pendingSettled = settlements.filter((s) => s.status === 'PENDING').reduce((acc, s) => acc + Number(s.net_amount || 0), 0);

  return (
    <div className="p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-6 text-left font-sans min-w-0 overflow-x-hidden">
      {/* NAVIGATION TABS */}
      <PaymentNavigationTabs />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            Settlement Payouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] font-normal mt-1 leading-relaxed">
            Track eligible balances, platform fees, and bank payouts from CubixSkill.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/settings/payments')}
          className="h-[44px] min-h-[44px] w-full sm:w-auto px-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs rounded-xl inline-flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          <Settings className="w-4 h-4" />
          <span>Settlement Settings</span>
        </button>
      </div>

      {/* DIRECT RAZORPAY MODE NOTICE BANNER */}
      {isMode1 ? (
        <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#263244] text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
              Direct Razorpay Payments Active
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              Your academy currently processes student payments directly through your connected Razorpay account. CubixSkill does not hold or settle these funds.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/settings/payments')}
            className="h-[44px] min-h-[44px] px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>View Payment Settings</span>
          </button>
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS (1 col on mobile 320px+) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#263244] space-y-1 shadow-2xs min-w-0">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Gross Sales</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] break-all">
                ₹{grossSales.toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#263244] space-y-1 shadow-2xs min-w-0">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Platform &amp; Gateway Fees</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-600 dark:text-[#CBD5E1] break-all">
                ₹{totalFees.toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#263244] space-y-1 shadow-2xs min-w-0">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Pending Settlement</span>
              <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 break-all">
                ₹{pendingSettled.toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#263244] space-y-1 shadow-2xs min-w-0">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Total Settled</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-[#6EE7B7] break-all">
                ₹{totalSettled.toLocaleString()}
              </span>
            </div>
          </div>

          {/* MOBILE STACKED SETTLEMENT CARDS (Below md breakpoint - 1 per row) */}
          <div className="block md:hidden space-y-3">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244]">
                Loading settlement history...
              </div>
            ) : settlements.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244]">
                No settlement records generated yet.
              </div>
            ) : (
              settlements.map((s) => (
                <div key={s.id || s.uuid} className="p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-2.5 text-xs text-left shadow-2xs w-full max-w-full min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-slate-900 dark:text-[#F8FAFC] font-semibold text-xs break-all">
                      Ref: {s.uuid ? s.uuid.slice(0, 8) : String(s.id || 'N/A')}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                        s.status === 'PAID'
                          ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] text-emerald-700 dark:text-[#6EE7B7]'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500 dark:text-[#94A3B8] block text-[10px]">Gross Sales</span>
                      <strong className="text-slate-900 dark:text-[#F8FAFC]">₹{Number(s.gross_amount).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-[#94A3B8] block text-[10px]">Fees</span>
                      <span className="text-slate-600 dark:text-[#CBD5E1]">₹{(Number(s.platform_fee) + Number(s.gateway_fee)).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-[#263244]">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-[#64748B] block">Net Payout</span>
                      <strong className="text-emerald-600 dark:text-[#6EE7B7] font-bold text-sm">
                        ₹{Number(s.net_amount).toLocaleString()}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-[#64748B] block">{s.settlement_method || 'UPI/Bank'}</span>
                      <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP SETTLEMENT TABLE (md and above) */}
          <div className="hidden md:block bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#263244] bg-slate-50 dark:bg-[#0F172A] text-slate-500 dark:text-[#94A3B8] font-medium text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 pl-4">Settlement ID</th>
                  <th className="p-3.5">Gross Amount</th>
                  <th className="p-3.5">Fees</th>
                  <th className="p-3.5">Net Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#263244]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-[#94A3B8]">
                      Loading settlements...
                    </td>
                  </tr>
                ) : settlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-[#94A3B8]">
                      No settlements generated yet.
                    </td>
                  </tr>
                ) : (
                  settlements.map((s) => (
                    <tr key={s.id || s.uuid} className="hover:bg-slate-50/50 dark:hover:bg-[#172033]/50 transition-colors">
                      <td className="p-3.5 pl-4 font-mono text-[11px] text-slate-900 dark:text-[#F8FAFC]">
                        {s.uuid ? s.uuid.slice(0, 8) : String(s.id || 'N/A')}
                      </td>
                      <td className="p-3.5 text-slate-900 dark:text-[#F8FAFC]">₹{Number(s.gross_amount).toLocaleString()}</td>
                      <td className="p-3.5 text-slate-500 dark:text-[#94A3B8]">₹{(Number(s.platform_fee) + Number(s.gateway_fee)).toLocaleString()}</td>
                      <td className="p-3.5 font-bold text-emerald-600 dark:text-[#6EE7B7]">₹{Number(s.net_amount).toLocaleString()}</td>
                      <td className="p-3.5 text-slate-700 dark:text-[#CBD5E1]">{s.settlement_method}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            s.status === 'PAID'
                              ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] text-emerald-700 dark:text-[#6EE7B7]'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-4 text-slate-500 dark:text-[#94A3B8]">{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

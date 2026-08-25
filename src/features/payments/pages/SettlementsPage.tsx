import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  CreditCard,
} from 'lucide-react';
import {
  paymentSettingsService,
  type PaymentSettingsData,
  type AcademySettlementItem,
} from '../../../services/paymentSettings.service';

export const SettlementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PaymentSettingsData | null>(null);
  const [settlements, setSettlements] = useState<AcademySettlementItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, settlementsRes] = await Promise.all([
        paymentSettingsService.getPaymentSettings(),
        paymentSettingsService.getSettlements(),
      ]);
      setSettings(settingsRes);
      setSettlements(settlementsRes);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const isMode1 = settings?.payment_mode === 'ACADEMY_RAZORPAY';

  const grossSales = settlements.reduce((acc, s) => acc + Number(s.gross_amount || 0), 0);
  const totalFees = settlements.reduce((acc, s) => acc + Number(s.platform_fee || 0) + Number(s.gateway_fee || 0), 0);
  const totalSettled = settlements.filter((s) => s.status === 'PAID').reduce((acc, s) => acc + Number(s.net_amount || 0), 0);
  const pendingSettled = settlements.filter((s) => s.status === 'PENDING').reduce((acc, s) => acc + Number(s.net_amount || 0), 0);

  if (isMode1) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-left font-sans min-w-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Settlements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] font-normal mt-1">
            Track eligible balances and payouts from CubixSkill.
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl border border-slate-200 dark:border-[#263244] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Direct Razorpay Payments
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              Your academy currently uses its own Razorpay account. Student payments are processed directly through your connected account, so CubixSkill does not manage your settlement balance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/settings/payments')}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Payment Settings</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left font-sans min-w-0">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Settlements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] font-normal mt-1">
            Track eligible balances and payouts from CubixSkill.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/settings/payments')}
          className="px-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs rounded-xl inline-flex items-center gap-2 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Settings className="w-4 h-4" />
          <span>Settlement Settings</span>
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] p-5 rounded-[14px] border border-slate-200 dark:border-[#263244]">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Gross Sales</span>
          <span className="text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC]">₹{grossSales.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-[#111827] p-5 rounded-[14px] border border-slate-200 dark:border-[#263244]">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Platform &amp; Gateway Fees</span>
          <span className="text-2xl font-semibold text-slate-600 dark:text-[#CBD5E1]">₹{totalFees.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-[#111827] p-5 rounded-[14px] border border-slate-200 dark:border-[#263244]">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Pending Settlement</span>
          <span className="text-2xl font-semibold text-amber-600 dark:text-amber-400">₹{pendingSettled.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-[#111827] p-5 rounded-[14px] border border-slate-200 dark:border-[#263244]">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium block">Total Settled</span>
          <span className="text-2xl font-semibold text-emerald-600 dark:text-[#6EE7B7]">₹{totalSettled.toLocaleString()}</span>
        </div>
      </div>

      {/* SETTLEMENT TABLE */}
      <div className="bg-white dark:bg-[#111827] rounded-[14px] border border-slate-200 dark:border-[#263244] overflow-x-auto shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#263244] bg-slate-50 dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-medium">
              <th className="p-3.5">Settlement ID</th>
              <th className="p-3.5">Gross Amount</th>
              <th className="p-3.5">Fees</th>
              <th className="p-3.5">Net Amount</th>
              <th className="p-3.5">Method</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Date</th>
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
                <tr key={s.id || s.uuid} className="hover:bg-slate-50/50 dark:hover:bg-[#172033]/50">
                  <td className="p-3.5 font-mono text-[11px] text-slate-900 dark:text-[#F8FAFC]">
                    {s.uuid ? s.uuid.slice(0, 8) : String(s.id || 'N/A')}
                  </td>
                  <td className="p-3.5 text-slate-900 dark:text-[#F8FAFC]">₹{Number(s.gross_amount).toLocaleString()}</td>
                  <td className="p-3.5 text-slate-500 dark:text-[#94A3B8]">₹{(Number(s.platform_fee) + Number(s.gateway_fee)).toLocaleString()}</td>
                  <td className="p-3.5 font-semibold text-emerald-600 dark:text-[#6EE7B7]">₹{Number(s.net_amount).toLocaleString()}</td>
                  <td className="p-3.5 text-slate-700 dark:text-[#CBD5E1]">{s.settlement_method}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.status === 'PAID'
                          ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] text-emerald-700 dark:text-[#6EE7B7]'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-[#94A3B8]">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

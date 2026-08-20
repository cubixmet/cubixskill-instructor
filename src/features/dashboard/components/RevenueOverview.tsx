import React from "react";
import { DollarSign, ArrowUpRight, AlertCircle } from "lucide-react";
import type { BackendRevenueAnalytics } from "../types/analytics.types";

interface RevenueOverviewProps {
  analytics: BackendRevenueAnalytics;
}

export const RevenueOverview: React.FC<RevenueOverviewProps> = ({ analytics }) => {
  const currencies = Object.keys(analytics);

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-5 shadow-2xs text-left transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Revenue &amp; Financial Analytics
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] dark:text-emerald-400 bg-[#F0FDF4] dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-[#BBF7D0] dark:border-emerald-800">
              <ArrowUpRight className="w-3 h-3" /> Real-time DB Metrics
            </span>
          </div>
          <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Gross earnings, issued refunds, and net revenue calculated per currency
          </p>
        </div>
      </div>

      {currencies.length === 0 ? (
        <div className="py-10 text-center space-y-2 bg-slate-50/50 dark:bg-[#172033]/50 rounded-xl border border-slate-100 dark:border-[#263244]">
          <DollarSign className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No revenue transactions recorded yet.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Completed course purchase orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currencies.map((curr) => {
            const item = analytics[curr];
            return (
              <div
                key={curr}
                className="p-4 bg-slate-50/80 dark:bg-[#172033] rounded-2xl border border-slate-200/80 dark:border-[#263244] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider bg-white dark:bg-[#111827] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#263244] shadow-2xs">
                    Currency: {curr}
                  </span>
                  <span className="text-xs font-extrabold text-[#16A34A] dark:text-emerald-400">
                    Net: {curr} {Number(item.net_revenue).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="bg-white dark:bg-[#111827] p-3 rounded-xl border border-slate-200/80 dark:border-[#263244] shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Revenue</p>
                    <p className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                      {curr} {Number(item.gross_revenue).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-[#111827] p-3 rounded-xl border border-slate-200/80 dark:border-[#263244] shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Refunds</p>
                    <p className="text-sm sm:text-base font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                      {curr} {Number(item.total_refunds).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-[#111827] p-3 rounded-xl border border-slate-200/80 dark:border-[#263244] shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Revenue</p>
                    <p className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      {curr} {Number(item.net_revenue).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


import React, { useState } from "react";
import { BarChart3, DollarSign, ChevronDown } from "lucide-react";
import type { BackendRevenueAnalytics } from "../types/analytics.types";

interface RevenueOverviewProps {
  analytics: BackendRevenueAnalytics;
}

export const RevenueOverview: React.FC<RevenueOverviewProps> = ({ analytics }) => {
  const currencies = Object.keys(analytics);
  const [selectedRange, setSelectedRange] = useState("Current Month");

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs text-left transition-all h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight truncate">
                Revenue &amp; Financial Analytics
              </h3>
              <p className="text-xs font-normal text-[var(--text-secondary)] truncate">
                Track revenue, orders and growth
              </p>
            </div>
          </div>

          <div className="relative shrink-0">
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="Current Month">Current Month</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Quarter">This Quarter</option>
              <option value="This Year">This Year</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {currencies.length === 0 ? (
          <div className="py-8 text-center space-y-2 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)]">
            <DollarSign className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
            <p className="text-xs font-semibold text-[var(--text-secondary)]">No revenue transactions recorded yet.</p>
            <p className="text-[11px] text-[var(--text-muted)]">Completed course purchase orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-3 w-full min-w-0">
            {currencies.map((curr) => {
              const item = analytics[curr];
              return (
                <div
                  key={curr}
                  className="p-3 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] space-y-3 w-full min-w-0"
                >
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold flex-wrap sm:flex-nowrap min-w-0">
                    <span className="text-[var(--text-secondary)] shrink-0">
                      Currency: <strong className="text-[var(--text-primary)]">{curr}</strong>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      Net: {curr} {Number(item.net_revenue).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 max-[340px]:grid-cols-1 gap-2.5 text-center w-full min-w-0">
                    {/* Gross Revenue: Spans full width on mobile (cols 1/-1), 1 col on desktop */}
                    <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] shadow-2xs col-span-2 max-[340px]:col-span-1 md:col-span-1 min-w-0">
                      <p className="text-[10px] sm:text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Gross Revenue</p>
                      <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 mt-1 whitespace-normal break-words leading-tight">
                        {curr} {Number(item.gross_revenue).toLocaleString()}
                      </p>
                    </div>

                    {/* Total Refunds */}
                    <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] shadow-2xs col-span-1 min-w-0">
                      <p className="text-[10px] sm:text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Refunds</p>
                      <p className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 mt-1 whitespace-normal break-words leading-tight">
                        {curr} {Number(item.total_refunds).toLocaleString()}
                      </p>
                    </div>

                    {/* Net Revenue */}
                    <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] shadow-2xs col-span-1 min-w-0">
                      <p className="text-[10px] sm:text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Net Revenue</p>
                      <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 whitespace-normal break-words leading-tight">
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
    </div>
  );
};


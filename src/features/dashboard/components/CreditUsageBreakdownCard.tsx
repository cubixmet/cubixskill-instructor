import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CreditUsageCategory } from '../types/dashboard.types';

interface CreditUsageBreakdownProps {
  categories: CreditUsageCategory[];
  totalCreditsUsed: number;
}

const COLORS = ['#2563EB', '#06B6D4', '#16A34A', '#F59E0B', '#8B5CF6', '#EC4899'];

export const CreditUsageBreakdownCard: React.FC<CreditUsageBreakdownProps> = ({ categories, totalCreditsUsed }) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-[#0F172A]">Credit Usage Breakdown</h3>
          <p className="text-xs text-[#64748B]">Per-feature student credit distribution ({totalCreditsUsed.toLocaleString()} credits)</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/credits/buy"
            className="px-3 py-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Buy Credits
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((cat, idx) => (
          <div key={cat.category} className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#0F172A]">{cat.category}</span>
              <span className="text-[#2563EB]">{cat.credits} Cr ({cat.percentage}%)</span>
            </div>
            <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${cat.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
        <Link to="/credits/history" className="text-[#2563EB] font-bold hover:underline flex items-center gap-1">
          View Credit Ledger <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

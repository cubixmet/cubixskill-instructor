import React from 'react';
import { CreditCard, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface FeatureCreditSummaryBarProps {
  baseCredit: number;
  featureAddonsCost: number;
  finalCreditsPerStudent: number;
  enabledFeaturesCount: number;
  unsavedCount?: number;
}

export const FeatureCreditSummaryBar: React.FC<FeatureCreditSummaryBarProps> = ({
  baseCredit = 10,
  featureAddonsCost = 8,
  finalCreditsPerStudent = 18,
  enabledFeaturesCount = 12,
  unsavedCount = 0,
}) => {
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-2 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Live Student Credit Impact</span>
              {unsavedCount > 0 && (
                <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-300">
                  {unsavedCount} Unsaved Changes
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {finalCreditsPerStudent} Credits
              </span>
              <span className="text-xs text-slate-500 font-medium">/ Enrolled Student</span>
            </div>
          </div>
        </div>

        {/* Breakdown Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 font-bold block text-[10px]">Mandatory Base</span>
            <span className="font-extrabold text-slate-900">{baseCredit} Credits</span>
          </div>

          <span className="text-slate-400 font-bold text-sm">+</span>

          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
            <span className="text-blue-700 font-bold block text-[10px]">Feature Add-ons</span>
            <span className="font-extrabold text-blue-950">+{featureAddonsCost} Credits</span>
          </div>

          <span className="text-slate-400 font-bold text-sm">=</span>

          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-emerald-700 font-bold block text-[10px]">Total Per Student</span>
            <span className="font-black text-emerald-950">{finalCreditsPerStudent} Credits</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Credits are deducted only when a student is successfully enrolled. Changing feature switches does NOT deduct wallet credits immediately.</span>
        </div>
        <span className="font-extrabold text-blue-600 shrink-0">{enabledFeaturesCount} Active Features</span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export interface FeatureCreditSummaryBarProps {
  baseCredit: number;
  featureAddonsCost: number;
  finalCreditsPerStudent: number;
  enabledFeaturesCount: number;
  unsavedCount?: number;
  enabledFeaturesList?: { name: string; cost: number }[];
}

export const FeatureCreditSummaryBar: React.FC<FeatureCreditSummaryBarProps> = ({
  baseCredit = 10,
  featureAddonsCost = 8,
  finalCreditsPerStudent = 18,
  enabledFeaturesCount = 12,
  unsavedCount = 0,
  enabledFeaturesList = [],
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-2 font-sans text-left">
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
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ⚡ {finalCreditsPerStudent} Credits
                </span>
                <span className="text-xs text-slate-500 font-medium">/ Enrolled Student</span>
              </div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
            <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 font-bold block text-[10px]">Mandatory Base</span>
              <span className="font-extrabold text-slate-900">{baseCredit} Credits</span>
            </div>

            <span className="text-slate-400 font-bold text-sm">+</span>

            <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-blue-700 font-bold block text-[10px]">Feature Add-ons</span>
              <span className="font-extrabold text-blue-950">+{featureAddonsCost} Credits</span>
            </div>

            <span className="text-slate-400 font-bold text-sm">=</span>

            <button
              type="button"
              onClick={() => setShowBreakdown(true)}
              className="px-3.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <div>
                <span className="text-emerald-700 font-bold block text-[10px]">Total Per Student</span>
                <span className="font-black text-emerald-950">{finalCreditsPerStudent} Credits</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
          <div className="flex items-center gap-1.5 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Credits are deducted only when a student is successfully enrolled.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowBreakdown(true)}
            className="font-extrabold text-blue-600 shrink-0 hover:underline cursor-pointer"
          >
            {enabledFeaturesCount} Active Features
          </button>
        </div>
      </div>

      {/* CREDIT BREAKDOWN MODAL */}
      {showBreakdown && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 text-left font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Credit Estimate Breakdown
              </h3>
              <button
                type="button"
                onClick={() => setShowBreakdown(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 font-bold text-slate-900">
                <span>Base Course Access</span>
                <span>{baseCredit} Credits</span>
              </div>

              {enabledFeaturesList.map((f, i) => (
                <div key={i} className="flex justify-between py-1 text-slate-600 font-medium">
                  <span>{f.name}</span>
                  <span className="font-bold text-blue-600">+{f.cost} Credits</span>
                </div>
              ))}

              <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-sm text-slate-900">
                <span>Total Per Enrolled Student</span>
                <span className="text-emerald-600">⚡ {finalCreditsPerStudent} Credits</span>
              </div>
            </div>

            <Button
              onClick={() => setShowBreakdown(false)}
              className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Close Breakdown
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

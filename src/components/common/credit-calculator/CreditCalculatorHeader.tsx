import React from 'react';
import { Calculator, Info, ShieldCheck } from 'lucide-react';

export const CreditCalculatorHeader: React.FC = () => {
  return (
    <div className="space-y-3 pb-5 border-b border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Live Credit Calculator
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" /> Active
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Estimate the credit cost per student before enrollment.
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed shadow-2xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="font-medium">
          Feature selection does not deduct credits. Credits are deducted only after student enrollment.
        </p>
      </div>
    </div>
  );
};

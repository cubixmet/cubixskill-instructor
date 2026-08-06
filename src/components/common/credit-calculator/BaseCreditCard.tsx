import React from 'react';
import { GraduationCap, ShieldCheck, Check } from 'lucide-react';

export const BaseCreditCard: React.FC = () => {
  return (
    <div className="min-h-[120px] p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl border border-blue-700/50 shadow-md text-white select-none relative overflow-hidden flex flex-col md:grid md:grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 text-left">
      {/* Column 1 (Left): Icon Container */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>

        {/* Mobile-only header badge */}
        <div className="md:hidden flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 text-[10px] font-bold uppercase tracking-wider">
            Required
          </span>
        </div>
      </div>

      {/* Column 2 (Center): Content Info */}
      <div className="min-w-0 space-y-1 w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-extrabold tracking-tight text-white leading-snug">
            Base Student Credit
          </h3>
          <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 text-[10px] font-bold uppercase tracking-wider">
            Required
          </span>
        </div>
        <p className="text-xs text-blue-100 font-medium leading-relaxed">
          Mandatory base platform fee per student enrollment.
        </p>
      </div>

      {/* Column 3 (Right): Value & Active Badge */}
      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
        <div className="text-left md:text-right shrink-0">
          <span className="text-xl sm:text-2xl font-black text-white block leading-none tracking-tight">
            10 Credits
          </span>
          <span className="text-[11px] font-semibold text-blue-200 block mt-1">
            per student
          </span>
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-bold shrink-0 cursor-not-allowed shadow-xs"
          title="Base student credit is mandatory."
        >
          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span>Always Active</span>
          <ShieldCheck className="w-3.5 h-3.5 text-blue-200 ml-0.5" />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Coins,
  Plus,
  Calculator,
} from 'lucide-react';

interface CreditWidgetProps {
  availableCredits: number;
  usedThisMonth: number;
  estimatedRemaining: number;
  onOpenBuyCredits?: () => void;
  onOpenCalculator?: () => void;
}

export const CreditWidget: React.FC<CreditWidgetProps> = ({
  availableCredits,
  usedThisMonth,
  estimatedRemaining: _estimatedRemaining,
  onOpenBuyCredits,
  onOpenCalculator,
}) => {
  return (
    <div className="bg-gradient-to-tr from-[#1E40AF] via-[#2563EB] to-[#3B82F6] text-white rounded-2xl p-6 shadow-md shadow-[#2563EB]/20 text-left relative overflow-hidden transition-all">
      {/* Background Graphic Accents */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#93C5FD]" />
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Enterprise Credit Engine
            </h3>
          </div>
          <p className="text-xs text-[#DBEAFE] mt-0.5 font-medium">
            AI auto-grading, video transcode & certificate generation pool
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCalculator}
            className="h-9 px-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Calculator</span>
          </button>

          <button
            type="button"
            onClick={onOpenBuyCredits}
            className="h-9 px-3.5 bg-white text-[#2563EB] hover:bg-blue-50 text-xs font-extrabold rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buy Credits</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
          <p className="text-xs font-semibold text-[#BFDBFE]">Current Balance</p>
          <h4 className="text-2xl font-black text-white mt-1 tracking-tight">
            {availableCredits.toLocaleString()} <span className="text-xs font-normal">Credits</span>
          </h4>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
          <p className="text-xs font-semibold text-[#BFDBFE]">Monthly Usage</p>
          <h4 className="text-2xl font-black text-white mt-1 tracking-tight">
            {usedThisMonth.toLocaleString()} <span className="text-xs font-normal">Used</span>
          </h4>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
          <p className="text-xs font-semibold text-[#BFDBFE]">Est. Days Remaining</p>
          <h4 className="text-2xl font-black text-white mt-1 tracking-tight">
            ~45 <span className="text-xs font-normal">Days</span>
          </h4>
        </div>
      </div>
    </div>
  );
};

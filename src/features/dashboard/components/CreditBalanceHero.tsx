import React from 'react';
import { Wallet, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CreditBalanceHeroProps {
  availableCredits: number;
  usedCreditsThisMonth: number;
  estimatedUpcomingCredits: number;
  purchasedCredits: number;
}

export const CreditBalanceHero: React.FC<CreditBalanceHeroProps> = ({
  availableCredits,
  usedCreditsThisMonth,
  estimatedUpcomingCredits,
}) => {
  const isLow = availableCredits < 2000;
  const usagePercentage = Math.min(100, Math.round((usedCreditsThisMonth / (availableCredits + usedCreditsThisMonth)) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-white via-slate-50 to-blue-50/50 border border-blue-200/60 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden space-y-5 text-left"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Available Credit Balance
            </span>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {availableCredits.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-slate-500">Credits</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <RouterLink
            to="/credits"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Buy Credits
          </RouterLink>
          <RouterLink
            to="/credits"
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 text-xs font-bold rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            View Usage <ArrowRight className="w-3.5 h-3.5" />
          </RouterLink>
        </div>
      </div>

      <div className="space-y-2 bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between text-xs font-semibold gap-2">
          <span className="text-slate-600">
            Used this month: <strong className="text-slate-900">{usedCreditsThisMonth.toLocaleString('en-IN')}</strong>
          </span>
          <span className="text-slate-600">
            Est. upcoming usage: <strong className="text-blue-600">{estimatedUpcomingCredits.toLocaleString('en-IN')}</strong>
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLow ? 'bg-rose-600' : 'bg-gradient-to-r from-blue-600 to-sky-400'
            }`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      {isLow && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-rose-700">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Your credit balance may not be enough for upcoming student enrollments. Please top up your wallet.</span>
        </div>
      )}
    </motion.div>
  );
};

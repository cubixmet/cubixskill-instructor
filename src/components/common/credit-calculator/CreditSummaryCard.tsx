import React from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Plus,
  BookmarkCheck,
  FileText,
} from 'lucide-react';
import type { CalculationResult } from './types';
import { Button } from '../../ui/Button';

interface CreditSummaryCardProps {
  calculation: CalculationResult;
  onOpenBreakdown: () => void;
  onConfirmEnrollment: () => void;
  onSaveConfig: () => void;
  onBuyCredits?: (needed: number) => void;
}

export const CreditSummaryCard: React.FC<CreditSummaryCardProps> = ({
  calculation,
  onOpenBreakdown,
  onConfirmEnrollment,
  onSaveConfig,
  onBuyCredits,
}) => {
  const {
    baseCreditPerStudent,
    selectedFeaturesCreditPerStudent,
    totalCreditPerStudent,
    studentCount,
    totalRequiredCredits,
    availableBalance,
    remainingBalance,
    shortageCredits,
    status,
    breakdownList,
  } = calculation;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-5 text-left lg:sticky lg:top-20 z-20 max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              Live Credit Calculator
            </h3>
            <p className="text-[11px] font-medium text-slate-500">
              Estimate credit cost per student before enrollment.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSaveConfig}
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Save Feature Configuration"
        >
          <BookmarkCheck className="w-4 h-4" />
        </button>
      </div>

      {/* Mandatory Clarification Message */}
      <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-[11px] text-blue-900 font-medium leading-relaxed">
        Feature selection does not deduct credits. Credits are deducted only after student enrollment.
      </div>

      {/* Primary Hero Calculation Box */}
      <div className="p-4 bg-[#0F172A] dark:bg-[#172033] border border-slate-200 dark:border-[#263244] rounded-2xl text-white space-y-3 shadow-inner">
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
          <span>Total Required Credits</span>
          <span className="font-bold text-blue-400">
            {totalCreditPerStudent} Cr × {studentCount} students
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {totalRequiredCredits.toLocaleString()}
          </span>
          <span className="text-sm font-extrabold text-blue-400">Credits</span>
        </div>

        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">
              Cost Per Student
            </span>
            <span className="font-extrabold text-slate-100 text-sm">
              {totalCreditPerStudent} Credits
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">
              Target Students
            </span>
            <span className="font-extrabold text-slate-100 text-sm">
              {studentCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Credit Breakdown Rows */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-1.5 border-b border-slate-100 font-medium text-slate-600">
          <span>Base Credit</span>
          <strong className="text-slate-900">{baseCreditPerStudent} credits</strong>
        </div>
        <div className="flex justify-between py-1.5 border-b border-slate-100 font-medium text-slate-600">
          <span>Feature Credits</span>
          <strong className="text-blue-600">+{selectedFeaturesCreditPerStudent} credits</strong>
        </div>
        <div className="flex justify-between py-1.5 border-b border-slate-100 font-bold text-slate-900 text-sm pt-1">
          <span>Total Per Student</span>
          <span className="text-blue-600">{totalCreditPerStudent} credits</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-slate-100 font-medium text-slate-600">
          <span>Target Students</span>
          <strong className="text-slate-900">{studentCount.toLocaleString()}</strong>
        </div>
        <div className="flex justify-between py-1.5 border-b border-slate-100 font-bold text-slate-900">
          <span>Total Required</span>
          <span className="text-slate-900 font-extrabold">{totalRequiredCredits.toLocaleString()} credits</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-slate-100 font-medium text-slate-600">
          <span>Available Balance</span>
          <strong className="text-slate-900">{availableBalance.toLocaleString()} credits</strong>
        </div>
        <div className="flex justify-between py-1.5 font-extrabold text-sm pt-1">
          <span>Remaining Balance</span>
          <span className={remainingBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}>
            {remainingBalance.toLocaleString()} credits
          </span>
        </div>
      </div>

      {/* Balance Status States */}
      {status === 'healthy' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Enough credits for this enrollment.</span>
        </div>
      )}

      {status === 'low' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Low balance ({remainingBalance.toLocaleString()} credits remaining).</span>
        </div>
      )}

      {status === 'insufficient' && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-900">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Insufficient Credit Balance</span>
          </div>
          <p className="font-medium text-slate-700">
            You need <strong className="text-rose-600 font-extrabold">{shortageCredits.toLocaleString()} more credits</strong> to complete this enrollment.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        {status === 'insufficient' ? (
          <Button
            className="w-full bg-rose-600 hover:bg-rose-700 text-white"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => onBuyCredits?.(shortageCredits)}
          >
            Buy Credits ({shortageCredits.toLocaleString()} Needed)
          </Button>
        ) : (
          <Button
            className="w-full"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onConfirmEnrollment}
          >
            Confirm Enrollment ({totalRequiredCredits.toLocaleString()} Credits)
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full text-xs"
          leftIcon={<FileText className="w-3.5 h-3.5" />}
          onClick={onOpenBreakdown}
        >
          View Full Cost Breakdown
        </Button>
      </div>

      {/* Footer Summary Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
        <span>Configured for {breakdownList.length + 1} features</span>
        <span className="text-blue-600 font-bold">{totalCreditPerStudent} credits per student</span>
      </div>
    </div>
  );
};

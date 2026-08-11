import React, { useState } from 'react';
import { ShieldCheck, Check, X, AlertCircle } from 'lucide-react';
import type { CalculationResult } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface EnrollmentConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: CalculationResult;
  courseTitle?: string;
  onConfirmSuccess: (details: {
    studentCount: number;
    totalCredits: number;
    remainingBalance: number;
  }) => void;
}

export const EnrollmentConfirmationDialog: React.FC<EnrollmentConfirmationDialogProps> = ({
  isOpen,
  onClose,
  calculation,
  courseTitle = 'Fullstack React 19 & TypeScript Masterclass',
  onConfirmSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const {
    totalCreditPerStudent,
    studentCount,
    totalRequiredCredits,
    availableBalance,
    remainingBalance,
  } = calculation;

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      onConfirmSuccess({
        studentCount,
        totalCredits: totalRequiredCredits,
        remainingBalance,
      });
    }, 600);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 text-left p-6 sm:p-7 space-y-5"
        >
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Enrollment Confirmed!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {totalRequiredCredits.toLocaleString()} credits have been deducted from your wallet for {studentCount.toLocaleString()} student enrollments.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 text-left">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Updated Wallet Balance:</span>
                  <strong className="text-slate-900 font-extrabold">{remainingBalance.toLocaleString()} Credits</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done & Return to Workspace
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      Enrollment
                    </h3>
                    <p className="text-xs text-slate-500">
                      Review total credit deduction before confirmation
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Course Title Banner */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Target Course
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {courseTitle}
                </p>
              </div>

              {/* Deduction Summary Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                  <span className="text-slate-500 font-medium block">Enrolled Students</span>
                  <strong className="text-slate-900 text-base font-extrabold block mt-0.5">
                    {studentCount.toLocaleString()} Students
                  </strong>
                </div>
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                  <span className="text-slate-500 font-medium block">Credits Per Student</span>
                  <strong className="text-blue-700 text-base font-extrabold block mt-0.5">
                    {totalCreditPerStudent} Credits
                  </strong>
                </div>
              </div>

              {/* Financial Balance Calculation */}
              <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Current Available Balance:</span>
                  <span className="font-bold text-slate-200">{availableBalance.toLocaleString()} Credits</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Total Credits to Deduct:</span>
                  <span className="font-black text-blue-400 text-sm">-{totalRequiredCredits.toLocaleString()} Credits</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-bold text-white">Remaining Balance:</span>
                  <strong className="font-black text-emerald-400">
                    {remainingBalance.toLocaleString()} Credits
                  </strong>
                </div>
              </div>

              {/* Warning note */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="font-medium">
                  Credits are deducted immediately upon clicking confirm. This action cannot be reversed.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Deducting Credits...</span>
                  ) : (
                    <span>Confirm & Deduct Credits</span>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React from 'react';
import { X, FileText } from 'lucide-react';
import type { CalculationResult } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface CreditBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: CalculationResult;
}

export const CreditBreakdownModal: React.FC<CreditBreakdownModalProps> = ({
  isOpen,
  onClose,
  calculation,
}) => {
  if (!isOpen) return null;

  const {
    baseCreditPerStudent,
    studentCount,
    totalRequiredCredits,
    breakdownList,
    totalCreditPerStudent,
  } = calculation;

  const baseTotal = baseCreditPerStudent * studentCount;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 text-left flex flex-col max-h-[85vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Full Credit Cost Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed calculation for {studentCount.toLocaleString()} enrolled students
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
            {/* Summary Pill */}
            <div className="p-4 bg-blue-50/60 border border-blue-200/60 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Total Cost Per Student</span>
                <strong className="text-blue-700 text-base font-extrabold">
                  {totalCreditPerStudent} Credits
                </strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium block">Grand Total Required</span>
                <strong className="text-slate-900 text-base font-black">
                  {totalRequiredCredits.toLocaleString()} Credits
                </strong>
              </div>
            </div>

            {/* List of Breakdown Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Base Student Fee
              </h4>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Base Student Credit</span>
                  <span className="text-slate-500 font-medium">
                    {baseCreditPerStudent} credits × {studentCount.toLocaleString()} students
                  </span>
                </div>
                <strong className="text-slate-900 font-extrabold text-sm">
                  {baseTotal.toLocaleString()} credits
                </strong>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Selected Add-on Features ({breakdownList.length})
              </h4>
              {breakdownList.length === 0 ? (
                <p className="text-xs text-slate-400 italic px-1">
                  No additional features selected. Only mandatory base student credit applies.
                </p>
              ) : (
                <div className="space-y-2">
                  {breakdownList.map((item) => (
                    <div
                      key={item.featureId}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/70 text-xs hover:bg-slate-50/50 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-slate-500 font-medium">
                          {item.costPerStudent} credit{item.costPerStudent !== 1 ? 's' : ''} × {studentCount.toLocaleString()} students
                        </span>
                      </div>
                      <strong className="text-blue-600 font-extrabold text-sm">
                        {item.totalCostForStudents.toLocaleString()} credits
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Calculation based on {studentCount} target enrollments
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

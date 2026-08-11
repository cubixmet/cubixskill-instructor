import React, { useRef, useEffect } from 'react';
import { User, X, ShieldCheck, Users } from 'lucide-react';
import { CreditCalculationResult } from '../types/credit.types';

interface CourseCreditPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: CreditCalculationResult;
  enrolledStudentsCount?: number;
}

export const CourseCreditPopover: React.FC<CourseCreditPopoverProps> = ({
  isOpen,
  onClose,
  calculation,
  enrolledStudentsCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalCourseUsage =
    enrolledStudentsCount && enrolledStudentsCount > 0
      ? enrolledStudentsCount * calculation.totalCreditsPerStudent
      : null;

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-11 z-40 w-72 sm:w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-4 space-y-3 font-sans text-left animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100 shrink-0">
            <User className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0F172A]">Credits per Student</h4>
            <span className="text-[10px] text-[#64748B] font-medium block">
              Estimated requirement per enrolled student
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Itemized Breakdown */}
      <div className="space-y-1.5 max-h-52 overflow-y-auto no-scrollbar py-1">
        {calculation.breakdown.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg border transition-colors ${
              item.isBase
                ? 'bg-blue-50/70 border-blue-100 font-semibold text-[#0F172A]'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {item.isBase && <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />}
              <span>{item.name}</span>
            </span>
            <span className={`font-bold ${item.isBase ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
              {item.creditCost > 0
                ? `${item.isBase ? '' : '+'}${item.creditCost} ${item.creditCost === 1 ? 'credit' : 'credits'}`
                : 'Included'}
            </span>
          </div>
        ))}
      </div>

      {/* Per Student Total */}
      <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
        <span className="font-semibold text-[#0F172A]">Estimated per Student</span>
        <span className="font-extrabold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
          {calculation.totalCreditsPerStudent} Credits / Student
        </span>
      </div>

      {/* Optional Course-Wide Total if Student Count is Known */}
      {totalCourseUsage !== null && (
        <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1 text-xs">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#2563EB]" /> Enrolled Students:
            </span>
            <strong className="text-[#0F172A]">{enrolledStudentsCount}</strong>
          </div>
          <div className="flex items-center justify-between font-bold text-[#0F172A] pt-0.5 border-t border-slate-200">
            <span>Estimated Total Usage:</span>
            <span className="text-[#2563EB]">{totalCourseUsage.toLocaleString()} Credits</span>
          </div>
        </div>
      )}
    </div>
  );
};

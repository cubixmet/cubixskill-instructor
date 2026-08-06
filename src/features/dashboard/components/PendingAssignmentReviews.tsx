import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PendingAssignmentItem } from '../types/dashboard.types';

interface PendingAssignmentReviewsProps {
  assignments: PendingAssignmentItem[];
}

export const PendingAssignmentReviews: React.FC<PendingAssignmentReviewsProps> = ({ assignments }) => {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-[#16A34A] mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-black text-[#0F172A]">All Submissions Reviewed!</h3>
        <p className="text-xs text-[#64748B]">No assignments are waiting for review.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#0F172A]">Pending Assignment Reviews</h3>
          <p className="text-xs text-[#64748B]">Submissions requiring grading & feedback</p>
        </div>
        <span className="px-2 py-0.5 bg-[#FEF2F2] text-[#DC2626] font-bold text-xs rounded-full border border-[#FCA5A5]/40">
          {assignments.length} Pending
        </span>
      </div>

      <div className="space-y-3">
        {assignments.map((item) => (
          <div key={item.id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A]">{item.title}</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                  item.priority === 'Overdue'
                    ? 'bg-[#FEF2F2] text-[#DC2626]'
                    : item.priority === 'Due Soon'
                    ? 'bg-[#FFFBEB] text-[#F59E0B]'
                    : 'bg-[#EFF6FF] text-[#2563EB]'
                }`}
              >
                {item.priority}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Student: <strong className="text-[#0F172A]">{item.student}</strong></span>
              <span>Submitted: {item.submitted}</span>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]/60 flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8] font-medium">{item.course}</span>
              <Link
                to={`/assignments/submissions/${item.id}`}
                className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold rounded-lg transition-colors"
              >
                Review Submission
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

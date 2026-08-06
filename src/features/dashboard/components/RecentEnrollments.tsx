import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RecentEnrollmentItem } from '../types/dashboard.types';

interface RecentEnrollmentsProps {
  enrollments: RecentEnrollmentItem[];
}

export const RecentEnrollments: React.FC<RecentEnrollmentsProps> = ({ enrollments }) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#0F172A]">Recent Enrollments</h3>
          <p className="text-xs text-[#64748B]">Latest active student signups</p>
        </div>
        <Link to="/students" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {enrollments.map((item) => (
          <div key={item.id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] font-black text-xs flex items-center justify-center shrink-0">
                {item.avatar || item.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0F172A] truncate">{item.name}</p>
                <p className="text-[11px] text-[#64748B] truncate">{item.course}</p>
              </div>
            </div>

            <div className="text-right shrink-0 space-y-0.5">
              <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#16A34A] font-extrabold text-[10px] rounded-md block">
                -{item.creditsDeducted} Credits
              </span>
              <span className="text-[10px] text-[#94A3B8] font-medium block">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

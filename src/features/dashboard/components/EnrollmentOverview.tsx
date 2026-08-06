import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { EnrollmentDataPoint } from '../types/dashboard.types';

interface EnrollmentOverviewProps {
  data: EnrollmentDataPoint[];
}

export const EnrollmentOverview: React.FC<EnrollmentOverviewProps> = ({ data }) => {
  const maxEnroll = Math.max(...data.map((d) => d.newStudents));

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-[#0F172A]">Student Enrollment Overview</h3>
          <p className="text-xs text-[#64748B]">Weekly new student enrollments trend</p>
        </div>
        <Link
          to="/students"
          className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 w-max"
        >
          View All Students <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 bg-[#F0FDF4] text-[#16A34A] text-[11px] font-extrabold rounded-full border border-[#BBF7D0]">
          New: +304 Students
        </span>
        <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-extrabold rounded-full border border-[#BFDBFE]">
          Active: 890
        </span>
      </div>

      {/* Mobile-optimized bar chart visualizer */}
      <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-[#E2E8F0] pb-2">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.newStudents / maxEnroll) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-[#0F172A] text-white px-1.5 py-0.5 rounded shadow-xs mb-1">
                {item.newStudents}
              </div>
              <div className="w-full max-w-[28px] bg-[#EFF6FF] rounded-t-lg group-hover:bg-[#2563EB] transition-colors relative overflow-hidden h-full flex items-end">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full bg-[#2563EB] rounded-t-lg transition-all duration-500"
                />
              </div>
              <span className="text-[11px] font-bold text-[#64748B]">{item.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

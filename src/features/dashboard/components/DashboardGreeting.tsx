import React from 'react';
import {
  Calendar,
  Building2,
  CheckCircle2,
  Plus,
  UserPlus,
  Coins,
  FileBarChart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardWelcome } from '../types/dashboard.types';

interface DashboardGreetingProps {
  welcome: DashboardWelcome;
  onOpenBuyCredits?: () => void;
}

export const DashboardGreeting: React.FC<DashboardGreetingProps> = ({
  welcome,
  onOpenBuyCredits,
}) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-2xs text-left transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
        {/* Top Info */}
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center font-black text-lg sm:text-xl shrink-0 shadow-md shadow-[#2563EB]/25">
            C
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                {welcome.greeting}
              </h1>
              <span className="inline-flex items-center gap-1 bg-[#F0FDF4] text-[#16A34A] text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {welcome.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-[#64748B] flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5 text-[#0F172A] font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#2563EB]" /> {welcome.academyName}
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="flex items-center gap-1 text-[#64748B]">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> {welcome.todayDate}
              </span>
            </p>
          </div>
        </div>

        {/* Responsive 2-Column Mobile / Inline Desktop Actions */}
        <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 sm:gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E2E8F0]">
          <Link
            to="/courses/create"
            className="h-10 min-h-[40px] px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-xs shadow-[#2563EB]/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full lg:w-auto"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">Create Course</span>
          </Link>

          <Link
            to="/students"
            className="h-10 min-h-[40px] px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full lg:w-auto"
          >
            <UserPlus className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span className="truncate">Add Student</span>
          </Link>

          <button
            type="button"
            onClick={onOpenBuyCredits}
            className="h-10 min-h-[40px] px-3 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full lg:w-auto"
          >
            <Coins className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span className="truncate">Buy Credits</span>
          </button>

          <Link
            to="/credits"
            className="h-10 min-h-[40px] px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full lg:w-auto"
          >
            <FileBarChart className="w-4 h-4 text-[#64748B] shrink-0" />
            <span className="truncate">Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

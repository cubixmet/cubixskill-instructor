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
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-2xs text-left transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Welcome Info */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-[#2563EB]/25">
            C
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                {welcome.greeting}
              </h1>
              <span className="inline-flex items-center gap-1 bg-[#F0FDF4] text-[#16A34A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                <CheckCircle2 className="w-3.5 h-3.5" /> {welcome.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-[#64748B] flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5 text-[#0F172A] font-semibold">
                <Building2 className="w-4 h-4 text-[#2563EB]" /> {welcome.academyName}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-[#64748B]">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> {welcome.todayDate}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Header CTAs & Search */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E2E8F0]">
          <Link
            to="/courses/create"
            className="h-10 px-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-xs shadow-[#2563EB]/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </Link>

          <Link
            to="/students"
            className="h-10 px-3.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#2563EB]" />
            <span>Add Student</span>
          </Link>

          <button
            type="button"
            onClick={onOpenBuyCredits}
            className="h-10 px-3.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4 text-[#2563EB]" />
            <span>Buy Credits</span>
          </button>

          <Link
            to="/credits"
            className="h-10 px-3.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileBarChart className="w-4 h-4 text-[#64748B]" />
            <span>Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

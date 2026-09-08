import React from 'react';
import {
  Calendar,
  Building2,
  CheckCircle2,
  ChevronRight,
  Plus,
  UserPlus,
  Coins,
  FileBarChart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardWelcome } from '../types/dashboard.types';
import { getUserInitials } from '../../../utils/branding.utils';

interface DashboardGreetingProps {
  welcome: DashboardWelcome;
  onOpenBuyCredits?: () => void;
}

export const DashboardGreeting: React.FC<DashboardGreetingProps> = ({
  welcome,
  onOpenBuyCredits,
}) => {
  // Extract instructor name from greeting if formatted like "Welcome Back, Suki Mcleod"
  const nameFromGreeting = welcome.greeting.replace(/^Welcome\s+Back,?\s*/i, '');
  const initials = getUserInitials(nameFromGreeting) || 'S';

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs text-left transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar + Details */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          {/* Admin Avatar Circle */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-base sm:text-lg shrink-0 shadow-xs">
            {initials}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                {welcome.greeting}
              </h1>
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> {welcome.status || "Active License"}
              </span>
            </div>

            <p className="text-xs font-medium text-[var(--text-secondary)] flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold truncate max-w-[200px] sm:max-w-none">
                <Building2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" /> {welcome.academyName}
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="flex items-center gap-1 text-[var(--text-secondary)] shrink-0">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB] shrink-0" /> {welcome.todayDate}
              </span>
            </p>
          </div>
        </div>

        {/* Right Arrow icon on Mobile / Desktop Action buttons on Desktop */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <Link
            to="/courses/create"
            className="h-9 px-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Create Course</span>
          </Link>

          <Link
            to="/students"
            className="h-9 px-3 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>Add Student</span>
          </Link>

          <button
            type="button"
            onClick={onOpenBuyCredits}
            className="h-9 px-3 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Coins className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>Buy Credits</span>
          </button>

          <Link
            to="/credits"
            className="h-9 px-3 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <FileBarChart className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <span>Reports</span>
          </Link>
        </div>

        <div className="lg:hidden shrink-0">
          <Link to="/settings" aria-label="Account Settings" className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

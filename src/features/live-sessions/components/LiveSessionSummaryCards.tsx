import React from 'react';
import {
  Radio,
  Clock,
  CheckCircle2,
  XCircle,
  Film,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export interface LiveSessionSummaryCardsProps {
  total: number;
  liveNow: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  recorded: number;
  avgAttendanceRate: number;
  onSelectStatusFilter?: (status: string) => void;
  activeStatusFilter?: string;
}

export const LiveSessionSummaryCards: React.FC<LiveSessionSummaryCardsProps> = ({
  total: _,
  liveNow,
  upcoming,
  completed,
  cancelled,
  recorded,
  avgAttendanceRate,
  onSelectStatusFilter,
  activeStatusFilter,
}) => {
  const cards = [
    { label: 'Upcoming', value: upcoming, icon: Clock, color: 'blue', statusKey: 'upcoming' },
    { label: 'Live Now', value: liveNow, icon: Radio, color: 'rose', statusKey: 'live' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'emerald', statusKey: 'completed' },
    { label: 'Recorded', value: recorded, icon: Film, color: 'indigo', statusKey: 'all' },
    { label: 'Avg Attendance', value: `${avgAttendanceRate}%`, icon: TrendingUp, color: 'amber', statusKey: undefined },
    { label: 'Cancelled', value: cancelled, icon: XCircle, color: 'slate', statusKey: 'cancelled' },
  ];

  const getColorStyles = (color: string) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/50 border-rose-200/50 dark:border-rose-800/40 text-rose-600 dark:text-rose-400';
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/50 dark:border-emerald-800/40 text-emerald-600 dark:text-[#6EE7B7]';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/50 dark:border-amber-800/40 text-amber-600 dark:text-[#FCD34D]';
      case 'indigo':
        return 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/50 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950/50 border-blue-200/50 dark:border-blue-800/40 text-[#2563EB] dark:text-[#60A5FA]';
      default:
        return 'bg-slate-100 dark:bg-[#1E293B]/70 border-slate-200 dark:border-[#334155] text-slate-600 dark:text-[#94A3B8]';
    }
  };

  return (
    <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 font-sans text-left min-w-0 w-full">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const colorStyle = getColorStyles(card.color);
        const isActive = card.statusKey && activeStatusFilter === card.statusKey;

        return (
          <Card
            key={idx}
            padding="none"
            onClick={() => {
              if (card.statusKey && onSelectStatusFilter) {
                onSelectStatusFilter(isActive ? 'all' : card.statusKey);
              }
            }}
            className={`bg-white dark:bg-[#111827] border rounded-[14px] p-2.5 sm:p-3 shadow-2xs min-w-0 flex flex-col justify-between transition-all ${
              card.statusKey ? 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-600' : ''
            } ${
              isActive
                ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
                : 'border-[#E2E8F0] dark:border-[#263244]'
            }`}
          >
            <div className="space-y-1.5 min-w-0">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center shrink-0 ${colorStyle}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.25]" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight truncate leading-none">
                  {card.value}
                </div>
                <div className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] truncate leading-tight">
                  {card.label}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

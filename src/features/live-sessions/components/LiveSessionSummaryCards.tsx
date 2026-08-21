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
}

export const LiveSessionSummaryCards: React.FC<LiveSessionSummaryCardsProps> = ({
  total: _,
  liveNow,
  upcoming,
  completed,
  cancelled,
  recorded,
  avgAttendanceRate,
}) => {
  const cards = [
    { title: 'Upcoming Sessions', value: upcoming, sub: 'Scheduled webinars', icon: Clock, color: 'blue' },
    { title: 'Live Now', value: liveNow, sub: 'Active meetings', icon: Radio, color: 'rose' },
    { title: 'Completed', value: completed, sub: 'Finished classes', icon: CheckCircle2, color: 'emerald' },
    { title: 'Recorded Hub', value: recorded, sub: 'Archived MP4s', icon: Film, color: 'indigo' },
    { title: 'Avg Attendance', value: `${avgAttendanceRate}%`, sub: 'Student participation', icon: TrendingUp, color: 'amber' },
    { title: 'Cancelled', value: cancelled, sub: 'Aborted meetings', icon: XCircle, color: 'slate' },
  ];

  const getColorStyles = (color: string) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-800/40 text-rose-600 dark:text-rose-400';
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-[#6EE7B7]';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-800/40 text-amber-600 dark:text-[#FCD34D]';
      case 'indigo':
        return 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-800/40 text-[#2563EB] dark:text-[#60A5FA]';
      default:
        return 'bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] text-slate-600 dark:text-[#94A3B8]';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-sans text-left">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const colorStyle = getColorStyles(card.color);

        return (
          <Card key={idx} padding="sm" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-xl border ${colorStyle}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">{card.value}</h4>
                <p className="text-[11px] font-semibold text-[#475569] dark:text-[#CBD5E1] truncate">{card.title}</p>
                <p className="text-[10px] font-normal text-[#64748B] dark:text-[#94A3B8] truncate">{card.sub}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

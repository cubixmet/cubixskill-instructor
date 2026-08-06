import React from 'react';
import {
  Video,
  Radio,
  Clock,
  CheckCircle2,
  XCircle,
  Film,
  Users,
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
  total,
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
        return 'bg-rose-50 border-rose-100 text-rose-600';
      case 'emerald':
        return 'bg-emerald-50 border-emerald-100 text-emerald-600';
      case 'amber':
        return 'bg-amber-50 border-amber-100 text-amber-600';
      case 'indigo':
        return 'bg-indigo-50 border-indigo-100 text-indigo-600';
      case 'blue':
        return 'bg-blue-50 border-blue-100 text-blue-600';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-sans text-left">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const colorStyle = getColorStyles(card.color);

        return (
          <Card key={idx} padding="sm" className="bg-white border border-slate-200/90 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-xl border ${colorStyle}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">{card.value}</h4>
                <p className="text-[11px] font-bold text-slate-700 truncate">{card.title}</p>
                <p className="text-[10px] font-medium text-slate-400 truncate">{card.sub}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

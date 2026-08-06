import React from 'react';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  HelpCircle,
  Award,
  Video,
  Megaphone,
  MessageSquare,
  CreditCard,
  DollarSign,
  Star,
  Clock,
  HardDrive,
} from 'lucide-react';
import { Card } from '../../../../components/ui/Card';

export interface ReportSummaryCardsProps {
  metrics: {
    totalStudents: number;
    activeStudents: number;
    completedStudents: number;
    completionRate: number;
    avgProgress: number;
    submittedAssignments: number;
    totalQuizAttempts: number;
    totalCertificates: number;
    avgAttendanceRate: number;
    avgReadRate: number;
    courseRating: number;
    creditsUsed: number;
    storageUsedGb: number;
    totalRevenue: number;
  };
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ metrics }) => {
  const cards = [
    { title: 'Total Students', value: metrics.totalStudents, sub: `${metrics.activeStudents} Active`, icon: Users, color: 'blue' },
    { title: 'Completion Rate', value: `${metrics.completionRate}%`, sub: `${metrics.completedStudents} Completed`, icon: CheckCircle2, color: 'emerald' },
    { title: 'Average Progress', value: `${metrics.avgProgress}%`, sub: 'Across syllabus', icon: TrendingUp, color: 'indigo' },
    { title: 'Quiz Attempts', value: metrics.totalQuizAttempts, sub: 'Passed 91%', icon: HelpCircle, color: 'amber' },
    { title: 'Certificates Issued', value: metrics.totalCertificates, sub: 'Verified credentials', icon: Award, color: 'rose' },
    { title: 'Live Attendance', value: `${metrics.avgAttendanceRate}%`, sub: 'Joined webinars', icon: Video, color: 'sky' },
    { title: 'Announcements Read', value: `${metrics.avgReadRate}%`, sub: 'Receipt confirmation', icon: Megaphone, color: 'purple' },
    { title: 'Total Course Revenue', value: `$${metrics.totalRevenue.toLocaleString()}`, sub: 'Net enrollment revenue', icon: DollarSign, color: 'emerald' },
  ];

  const getColorStyles = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 border-emerald-100 text-emerald-600';
      case 'indigo':
        return 'bg-indigo-50 border-indigo-100 text-indigo-600';
      case 'amber':
        return 'bg-amber-50 border-amber-100 text-amber-600';
      case 'rose':
        return 'bg-rose-50 border-rose-100 text-rose-600';
      case 'sky':
        return 'bg-sky-50 border-sky-100 text-sky-600';
      case 'purple':
        return 'bg-purple-50 border-purple-100 text-purple-600';
      default:
        return 'bg-blue-50 border-blue-100 text-blue-600';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-sans text-left">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const colorStyle = getColorStyles(card.color);

        return (
          <Card key={idx} padding="sm" className="bg-white border border-slate-200/90 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-xl border ${colorStyle}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900 tracking-tight truncate">{card.value}</h4>
                <p className="text-[10px] font-bold text-slate-700 truncate">{card.title}</p>
                <p className="text-[9px] font-medium text-slate-400 truncate">{card.sub}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

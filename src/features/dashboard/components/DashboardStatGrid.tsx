import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  FileEdit,
  Users,
  UserCheck,
  DollarSign,
  Coins,
  HardDrive,
  Award,
  FileCheck,
  HelpCircle,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import type { DashboardSummaryStats } from '../types/dashboard.types';
import { DashboardPermissionGuard } from './DashboardPermissionGuard';
import { formatCurrency } from '../../../utils/currency';

interface DashboardStatGridProps {
  stats: DashboardSummaryStats;
}

export const DashboardStatGrid: React.FC<DashboardStatGridProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Courses',
      value: stats.totalCourses.toLocaleString(),
      subtitle: `${stats.publishedCourses} Published · ${stats.draftCourses} Draft`,
      icon: BookOpen,
      color: 'text-[#2563EB]',
      bgColor: 'bg-[#EFF6FF]',
      borderColor: 'border-[#BFDBFE]',
      trend: '+12%',
      permission: 'courses' as const,
    },
    {
      title: 'Published Courses',
      value: stats.publishedCourses.toLocaleString(),
      subtitle: 'Active in catalog',
      icon: CheckCircle2,
      color: 'text-[#16A34A]',
      bgColor: 'bg-[#F0FDF4]',
      borderColor: 'border-[#BBF7D0]',
      trend: '+8%',
      permission: 'courses' as const,
    },
    {
      title: 'Draft Courses',
      value: stats.draftCourses.toLocaleString(),
      subtitle: 'In construction',
      icon: FileEdit,
      color: 'text-[#D97706]',
      bgColor: 'bg-[#FEF3C7]',
      borderColor: 'border-[#FDE68A]',
      trend: '2 pending',
      permission: 'courses' as const,
    },
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      subtitle: `${stats.activeStudents} active`,
      icon: Users,
      color: 'text-[#0EA5E9]',
      bgColor: 'bg-[#E0F2FE]',
      borderColor: 'border-[#BAE6FD]',
      trend: '+18.4%',
      permission: 'students' as const,
    },
    {
      title: 'Active Students',
      value: stats.activeStudents.toLocaleString(),
      subtitle: 'Learning past 30 days',
      icon: UserCheck,
      color: 'text-[#0D9488]',
      bgColor: 'bg-[#CCFBF1]',
      borderColor: 'border-[#99F6E4]',
      trend: '84% rate',
      permission: 'students' as const,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      subtitle: `${stats.totalSales} Sales`,
      icon: DollarSign,
      color: 'text-[#16A34A]',
      bgColor: 'bg-[#F0FDF4]',
      borderColor: 'border-[#BBF7D0]',
      trend: '+24.5%',
      permission: 'revenue' as const,
    },
    {
      title: 'Credits Remaining',
      value: stats.availableCredits.toLocaleString(),
      subtitle: `${stats.usedCreditsThisMonth} used this mo`,
      icon: Coins,
      color: 'text-[#2563EB]',
      bgColor: 'bg-[#EFF6FF]',
      borderColor: 'border-[#BFDBFE]',
      trend: 'Est. 45 days',
      permission: 'credits' as const,
    },
    {
      title: 'Storage Used',
      value: `${stats.storageUsedGB} GB`,
      subtitle: `of ${stats.storageTotalGB} GB limit`,
      icon: HardDrive,
      color: 'text-[#8B5CF6]',
      bgColor: 'bg-[#F3E8FF]',
      borderColor: 'border-[#DDD6FE]',
      trend: '24.5%',
    },
    {
      title: 'Certificates Issued',
      value: stats.certificatesIssued.toLocaleString(),
      subtitle: `${stats.certificatesVerified} verified`,
      icon: Award,
      color: 'text-[#EC4899]',
      bgColor: 'bg-[#FCE7F3]',
      borderColor: 'border-[#FBCFE8]',
      trend: '+15%',
    },
    {
      title: 'Assignments Review',
      value: stats.pendingAssignments.toLocaleString(),
      subtitle: 'Awaiting grade',
      icon: FileCheck,
      color: 'text-[#EAB308]',
      bgColor: 'bg-[#FEF9C3]',
      borderColor: 'border-[#FEF08A]',
      trend: 'Action needed',
    },
    {
      title: 'Quiz Attempts',
      value: stats.quizAttemptsPending.toLocaleString(),
      subtitle: 'Manual review required',
      icon: HelpCircle,
      color: 'text-[#F97316]',
      bgColor: 'bg-[#FFEDD5]',
      borderColor: 'border-[#FED7AA]',
      trend: '3 urgent',
    },
    {
      title: 'Community Members',
      value: stats.communityMembers.toLocaleString(),
      subtitle: 'Students & discussion leads',
      icon: MessageSquare,
      color: 'text-[#6366F1]',
      bgColor: 'bg-[#EEF2FF]',
      borderColor: 'border-[#C7D2FE]',
      trend: '+28 new',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <DashboardPermissionGuard key={card.title} permission={card.permission}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              whileHover={{ y: -2 }}
              className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-full min-h-[145px] sm:min-h-[160px] group min-w-0"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className={`p-1.5 sm:p-2 rounded-xl ${card.bgColor} ${card.color} border ${card.borderColor} transition-transform group-hover:scale-105 shrink-0`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-1.5 py-0.5 rounded-full shrink-0 max-w-full truncate">
                    <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{card.trend}</span>
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs font-semibold text-slate-600 mb-1 leading-snug line-clamp-2">
                  {card.title}
                </p>
                <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-[#2563EB] transition-colors truncate min-w-0">
                  {card.value}
                </h3>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-slate-500 min-w-0">
                <span className="truncate">{card.subtitle}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-[#2563EB] transition-colors shrink-0" />
              </div>
            </motion.div>
          </DashboardPermissionGuard>
        );
      })}
    </div>
  );
};

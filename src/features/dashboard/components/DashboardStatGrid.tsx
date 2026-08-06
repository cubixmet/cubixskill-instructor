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
    },
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      subtitle: `${stats.activeStudents} currently active`,
      icon: Users,
      color: 'text-[#0EA5E9]',
      bgColor: 'bg-[#E0F2FE]',
      borderColor: 'border-[#BAE6FD]',
      trend: '+18.4%',
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
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      subtitle: `${stats.totalSales} Course Sales`,
      icon: DollarSign,
      color: 'text-[#16A34A]',
      bgColor: 'bg-[#F0FDF4]',
      borderColor: 'border-[#BBF7D0]',
      trend: '+24.5%',
    },
    {
      title: 'Credits Remaining',
      value: stats.availableCredits.toLocaleString(),
      subtitle: `${stats.usedCreditsThisMonth} used this month`,
      icon: Coins,
      color: 'text-[#2563EB]',
      bgColor: 'bg-[#EFF6FF]',
      borderColor: 'border-[#BFDBFE]',
      trend: 'Est. 45 days',
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
      subtitle: 'Submissions awaiting grade',
      icon: FileCheck,
      color: 'text-[#EAB308]',
      bgColor: 'bg-[#FEF9C3]',
      borderColor: 'border-[#FEF08A]',
      trend: 'Action needed',
    },
    {
      title: 'Quiz Attempts Pending',
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-left">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
            whileHover={{ y: -3 }}
            className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-full group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color} border ${card.borderColor} transition-transform group-hover:scale-105`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {card.trend}
                </span>
              </div>

              <p className="text-xs font-semibold text-[#64748B] mb-1">
                {card.title}
              </p>
              <h3 className="text-2xl font-black text-[#0F172A] tracking-tight group-hover:text-[#2563EB] transition-colors">
                {card.value}
              </h3>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] font-medium text-[#64748B]">
              <span className="truncate">{card.subtitle}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors shrink-0" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  FileCheck2,
  HelpCircle,
  UploadCloud,
  Coins,
  FileBarChart2,
  Award,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickActionsProps {
  onOpenBuyCredits?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onOpenBuyCredits }) => {
  const actions = [
    {
      title: 'Create Course',
      desc: 'Build new curriculum & lessons',
      icon: PlusCircle,
      href: '/courses/create',
      color: 'text-[#2563EB]',
      bgColor: 'bg-[#EFF6FF]',
      borderColor: 'border-[#BFDBFE]',
    },
    {
      title: 'Create Assignment',
      desc: 'Publish hands-on projects',
      icon: FileCheck2,
      href: '/courses',
      color: 'text-[#0EA5E9]',
      bgColor: 'bg-[#E0F2FE]',
      borderColor: 'border-[#BAE6FD]',
    },
    {
      title: 'Create Quiz',
      desc: 'Add auto-graded assessments',
      icon: HelpCircle,
      href: '/courses',
      color: 'text-[#8B5CF6]',
      bgColor: 'bg-[#F3E8FF]',
      borderColor: 'border-[#DDD6FE]',
    },
    {
      title: 'Upload Media',
      desc: 'Add 4K video, audio & PDFs',
      icon: UploadCloud,
      href: '/credits',
      color: 'text-[#10B981]',
      bgColor: 'bg-[#D1FAE5]',
      borderColor: 'border-[#A7F3D0]',
    },
    {
      title: 'Buy Credits',
      desc: 'Top up AI & streaming credits',
      icon: Coins,
      onClick: onOpenBuyCredits,
      href: '/credits',
      color: 'text-[#D97706]',
      bgColor: 'bg-[#FEF3C7]',
      borderColor: 'border-[#FDE68A]',
    },
    {
      title: 'Generate Report',
      desc: 'Export revenue & student stats',
      icon: FileBarChart2,
      href: '/credits',
      color: 'text-[#6366F1]',
      bgColor: 'bg-[#EEF2FF]',
      borderColor: 'border-[#C7D2FE]',
    },
    {
      title: 'Manage Certificates',
      desc: 'Design templates & verify',
      icon: Award,
      href: '/courses',
      color: 'text-[#EC4899]',
      bgColor: 'bg-[#FCE7F3]',
      borderColor: 'border-[#FBCFE8]',
    },
    {
      title: 'Manage Students',
      desc: 'Directory, progress & access',
      icon: Users,
      href: '/students',
      color: 'text-[#0D9488]',
      bgColor: 'bg-[#CCFBF1]',
      borderColor: 'border-[#99F6E4]',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-5 shadow-2xs text-left">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Quick Actions
          </h3>
          <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
            Instant shortcuts for high-frequency academy management tasks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => {
          const IconComponent = action.icon;
          const content = (
            <motion.div
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-3.5 bg-[#FFFFFF] dark:bg-[#111827] hover:bg-[#F8FAFC] dark:hover:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] hover:border-[#CBD5E1] dark:hover:border-[rgba(59,130,246,0.35)] shadow-xs dark:shadow-[0_4px_16px_rgba(37,99,235,0.08)] rounded-xl transition-all cursor-pointer flex items-center gap-3 group h-full"
            >
              <div className={`p-2.5 rounded-lg ${action.bgColor} dark:bg-[#172033] ${action.color} border ${action.borderColor} dark:border-[#263244] shrink-0 transition-transform group-hover:scale-110`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors truncate">
                    {action.title}
                  </h4>
                  <ArrowRight className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors shrink-0" />
                </div>
                <p className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                  {action.desc}
                </p>
              </div>
            </motion.div>
          );

          if (action.onClick) {
            return (
              <button
                key={action.title}
                type="button"
                onClick={action.onClick}
                className="w-full text-left"
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={action.title} to={action.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

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
  Zap,
  ChevronRight,
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
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Create Assignment',
      desc: 'Publish hands-on projects',
      icon: FileCheck2,
      href: '/courses',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Create Quiz',
      desc: 'Add auto-graded assessments',
      icon: HelpCircle,
      href: '/courses',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Upload Media',
      desc: 'Add 4K video, audio & PDFs',
      icon: UploadCloud,
      href: '/credits',
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
    },
    {
      title: 'Buy Credits',
      desc: 'Top up AI & streaming credits',
      icon: Coins,
      onClick: onOpenBuyCredits,
      href: '/credits',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Generate Report',
      desc: 'Export revenue & student stats',
      icon: FileBarChart2,
      href: '/credits',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      title: 'Manage Certificates',
      desc: 'Design templates & verify',
      icon: Award,
      href: '/courses',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
    },
    {
      title: 'Manage Students',
      desc: 'Directory, progress & access',
      icon: Users,
      href: '/students',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
  ];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs text-left transition-all">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight truncate">
              Quick Actions
            </h3>
            <p className="text-xs font-normal text-[var(--text-secondary)] truncate">
              Instant shortcuts for common tasks
            </p>
          </div>
        </div>
        <Link
          to="/courses"
          className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline flex items-center gap-0.5 shrink-0"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {actions.map((action) => {
          const IconComponent = action.icon;
          const content = (
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="p-2 sm:p-2.5 bg-[var(--surface-secondary)] border border-[var(--border)] hover:border-[var(--brand-primary)]/40 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 h-20 sm:h-24 group"
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${action.bgColor} ${action.color} border ${action.borderColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <h4 className="text-[10px] sm:text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors leading-tight line-clamp-2">
                {action.title}
              </h4>
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

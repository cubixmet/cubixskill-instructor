import React from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck,
  ShoppingCart,
  FileCheck,
  HelpCircle,
  Award,
  Coins,
  UploadCloud,
  Clock,
} from 'lucide-react';
import type { ActivityTimelineItem } from '../types/dashboard.types';

interface RecentActivityTimelineProps {
  activities: ActivityTimelineItem[];
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({
  activities,
}) => {
  const getIcon = (type: ActivityTimelineItem['type']) => {
    switch (type) {
      case 'Student Enrolled':
        return <UserCheck className="w-4 h-4 text-[#0EA5E9]" />;
      case 'Course Purchased':
        return <ShoppingCart className="w-4 h-4 text-[#16A34A]" />;
      case 'Assignment Submitted':
        return <FileCheck className="w-4 h-4 text-[#2563EB]" />;
      case 'Quiz Completed':
        return <HelpCircle className="w-4 h-4 text-[#8B5CF6]" />;
      case 'Certificate Generated':
        return <Award className="w-4 h-4 text-[#EC4899]" />;
      case 'Credits Purchased':
        return <Coins className="w-4 h-4 text-[#D97706]" />;
      case 'Media Uploaded':
        return <UploadCloud className="w-4 h-4 text-[#10B981]" />;
      default:
        return <Clock className="w-4 h-4 text-[#64748B]" />;
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs text-left transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
            Recent Activity Feed
          </h3>
          <p className="text-xs font-medium text-[#64748B]">
            Real-time academy timeline across enrollments, sales & submissions
          </p>
        </div>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
        {activities.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="relative flex items-start justify-between gap-3 text-xs"
          >
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-[#2563EB] flex items-center justify-center shadow-xs">
              {getIcon(item.type)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium text-[#0F172A]">
                <strong className="font-extrabold text-[#0F172A]">{item.user}</strong>{' '}
                <span className="text-[#64748B]">{item.description}</span>
              </p>
              <span className="text-[10px] font-semibold text-[#94A3B8] inline-block mt-0.5">
                {item.timestamp}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  ChevronRight,
  FileCheck2,
  HelpCircle,
  Award,
  HardDrive,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PendingAssignmentItem } from '../types/dashboard.types';

interface PendingItemsWidgetProps {
  items: PendingAssignmentItem[];
}

export const PendingItemsWidget: React.FC<PendingItemsWidgetProps> = ({ items }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs text-left transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Pending Items & Review Queue
            </h3>
            <span className="bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {items.length} Requires Action
            </span>
          </div>
          <p className="text-xs font-medium text-[#64748B] mt-0.5">
            Assignments awaiting grading, quiz manual checks, and storage alerts
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const isOverdue = item.priority === 'Overdue';
          const isDueSoon = item.priority === 'Due Soon';

          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 3 }}
              className="p-3.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    item.type === 'assignment'
                      ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                      : item.type === 'quiz_review'
                      ? 'bg-[#F3E8FF] text-[#8B5CF6] border-[#DDD6FE]'
                      : item.type === 'certificate_request'
                      ? 'bg-[#FCE7F3] text-[#EC4899] border-[#FBCFE8]'
                      : 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                  }`}
                >
                  {item.type === 'assignment' && <FileCheck2 className="w-5 h-5" />}
                  {item.type === 'quiz_review' && <HelpCircle className="w-5 h-5" />}
                  {item.type === 'certificate_request' && <Award className="w-5 h-5" />}
                  {item.type === 'system_alert' && <HardDrive className="w-5 h-5" />}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-[#0F172A] truncate">
                      {item.title}
                    </h4>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isOverdue
                          ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]'
                          : isDueSoon
                          ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                          : 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-[#64748B] mt-0.5 flex flex-wrap items-center gap-2">
                    <span>Submitted by <strong className="text-[#0F172A]">{item.student}</strong></span>
                    <span>&bull;</span>
                    <span>{item.course}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0]">
                <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  {item.submitted}
                </span>

                <Link
                  to="/courses"
                  className="h-8 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Review</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { FileCheck, HelpCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { AssignmentWidgetStats, QuizWidgetStats } from '../types/dashboard.types';

interface AssignmentQuizWidgetProps {
  assignmentStats: AssignmentWidgetStats;
  quizStats: QuizWidgetStats;
}

export const AssignmentQuizWidget: React.FC<AssignmentQuizWidgetProps> = ({
  assignmentStats,
  quizStats,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      {/* Assignment Widget Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs transition-all">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-[#EFF6FF] text-[#2563EB]">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Assignments Hub
            </h3>
            <p className="text-xs text-[#64748B] font-medium">Evaluation and grading statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
            <p className="text-[11px] font-semibold text-[#64748B]">Pending Review</p>
            <p className="text-xl font-black text-[#D97706] mt-0.5">{assignmentStats.pendingReview}</p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
            <p className="text-[11px] font-semibold text-[#64748B]">Graded Today</p>
            <p className="text-xl font-black text-[#16A34A] mt-0.5">{assignmentStats.approvedToday}</p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
            <p className="text-[11px] font-semibold text-[#64748B]">Late Submissions</p>
            <p className="text-xl font-black text-[#EF4444] mt-0.5">{assignmentStats.lateSubmissions}</p>
          </div>
        </div>
      </div>

      {/* Quiz Widget Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs transition-all">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-[#F3E8FF] text-[#8B5CF6]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Quiz & Assessment Engine
            </h3>
            <p className="text-xs text-[#64748B] font-medium">Pass rates and quiz attempt analytics</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
            <p className="text-[11px] font-semibold text-[#64748B]">Pass Rate</p>
            <p className="text-xl font-black text-[#16A34A] mt-0.5">{quizStats.passRate}%</p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
            <p className="text-[11px] font-semibold text-[#64748B]">Average Score</p>
            <p className="text-xl font-black text-[#2563EB] mt-0.5">{quizStats.averageScore}%</p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
            <p className="text-[11px] font-semibold text-[#64748B]">Manual Checks</p>
            <p className="text-xl font-black text-[#8B5CF6] mt-0.5">{quizStats.manualReviews}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

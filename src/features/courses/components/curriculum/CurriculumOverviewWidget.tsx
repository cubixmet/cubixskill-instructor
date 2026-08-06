import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Film,
  Clock,
  CheckCircle2,
  FileEdit,
  Plus,
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CurriculumOverviewWidgetProps {
  moduleCount: number;
  totalLessonCount: number;
  totalDurationMinutes: number;
  publishedCount: number;
  draftCount: number;
  onAddModule: () => void;
  onSaveDraft: () => void;
  onAddLesson: () => void;
  onPreviewCourse: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export const CurriculumOverviewWidget: React.FC<CurriculumOverviewWidgetProps> = ({
  moduleCount,
  totalLessonCount,
  totalDurationMinutes,
  publishedCount,
  draftCount,
  onAddModule,
  onSaveDraft,
  onAddLesson,
  onPreviewCourse,
  onExpandAll,
  onCollapseAll,
}) => {
  // Format duration into hours and minutes
  const hours = Math.floor(totalDurationMinutes / 60);
  const mins = totalDurationMinutes % 60;
  const formattedDuration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Calculate Progress percentage based on published vs total
  const progressPercent =
    totalLessonCount > 0 ? Math.round((publishedCount / totalLessonCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-6 text-left font-sans w-full max-w-[340px]"
    >
      {/* Widget Header */}
      <div>
        <h3 className="text-[18px] font-semibold text-[#0F172A] tracking-tight">
          Curriculum Overview
        </h3>
        <p className="text-[13px] font-normal text-[#64748B] mt-0.5">
          Real-time curriculum statistics
        </p>
      </div>

      {/* 2-Column Responsive Statistic Mini-Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Modules Mini Card */}
        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 rounded-xl transition-all space-y-1">
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <BookOpen className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[13px] font-medium text-[#64748B]">Modules</span>
          </div>
          <span className="text-[28px] font-bold text-[#2563EB] block leading-none pt-1">
            {moduleCount}
          </span>
        </div>

        {/* Lessons Mini Card */}
        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 rounded-xl transition-all space-y-1">
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Film className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[13px] font-medium text-[#64748B]">Lessons</span>
          </div>
          <span className="text-[28px] font-bold text-[#2563EB] block leading-none pt-1">
            {totalLessonCount}
          </span>
        </div>

        {/* Total Duration Mini Card */}
        <div className="col-span-2 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 rounded-xl transition-all space-y-1">
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[13px] font-medium text-[#64748B]">Total Duration</span>
          </div>
          <span className="text-[24px] font-bold text-[#2563EB] block leading-none pt-1">
            {formattedDuration}
          </span>
        </div>

        {/* Published Mini Card */}
        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 rounded-xl transition-all space-y-1">
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-[13px] font-medium text-[#64748B]">Published</span>
          </div>
          <span className="text-[28px] font-bold text-[#2563EB] block leading-none pt-1">
            {publishedCount}
          </span>
        </div>

        {/* Draft Mini Card */}
        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 rounded-xl transition-all space-y-1">
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <FileEdit className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[13px] font-medium text-[#64748B]">Draft</span>
          </div>
          <span className="text-[28px] font-bold text-[#2563EB] block leading-none pt-1">
            {draftCount}
          </span>
        </div>
      </div>

      {/* Curriculum Progress Section */}
      <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold text-[#0F172A]">Curriculum Progress</span>
          <span className="font-bold text-[#2563EB]">{progressPercent}%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-[#F8FAFC] h-2.5 rounded-full border border-[#E2E8F0] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-[#2563EB] rounded-full"
          />
        </div>

        <p className="text-[12px] font-normal text-[#64748B]">
          {publishedCount} of {totalLessonCount} planned lessons published
        </p>
      </div>

      {/* Primary & Secondary Action Buttons */}
      <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
        {/* + Add Module Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onAddModule}
          className="w-full h-[48px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[14px] rounded-[14px] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Module</span>
        </motion.button>

        {/* Save Draft Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onSaveDraft}
          className="w-full h-[48px] bg-white border border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB]/5 font-semibold text-[14px] rounded-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Draft</span>
        </motion.button>
      </div>

      {/* Extra Quick Actions */}
      <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0]">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B] block">
          Quick Actions
        </span>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onAddLesson}
            className="h-9 px-2.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB] text-[#0F172A] hover:text-[#2563EB] rounded-xl text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lesson</span>
          </button>

          <button
            type="button"
            onClick={onPreviewCourse}
            className="h-9 px-2.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB] text-[#0F172A] hover:text-[#2563EB] rounded-xl text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={onExpandAll}
            className="h-9 px-2.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB] text-[#0F172A] hover:text-[#2563EB] rounded-xl text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>Expand All</span>
          </button>

          <button
            type="button"
            onClick={onCollapseAll}
            className="h-9 px-2.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB] text-[#0F172A] hover:text-[#2563EB] rounded-xl text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

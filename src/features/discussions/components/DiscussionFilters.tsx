import React, { useState } from 'react';
import { Search, Filter, RotateCcw, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export interface CourseOption {
  id: string;
  title: string;
}

export interface DiscussionFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCourseId?: string | null;
  onCourseChange?: (courseId: string | null) => void;
  coursesList?: CourseOption[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  createdByFilter: string;
  onCreatedByChange: (val: string) => void;
  onReset: () => void;
}

const CATEGORIES = ['All', 'General', 'Q&A', 'Feedback', 'Announcements', 'Assignments', 'Technical'];
const STATUSES = [
  { id: 'all', label: 'All Discussions' },
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'locked', label: 'Locked' },
  { id: 'archived', label: 'Archived' },
  { id: 'announcements', label: 'Announcements' },
];
const SORTS = [
  { id: 'recent', label: 'Recent Activity' },
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'popular', label: 'Popular' },
  { id: 'unanswered', label: 'Unanswered' },
];

export const DiscussionFilters: React.FC<DiscussionFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCourseId = null,
  onCourseChange,
  coursesList = [],
  selectedCategory,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  createdByFilter,
  onCreatedByChange,
  onReset,
}) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const activeFiltersCount =
    (selectedCourseId ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (sortBy !== 'recent' ? 1 : 0) +
    (createdByFilter !== 'all' ? 1 : 0);

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-3 sm:p-4 space-y-3 font-sans text-xs text-left shadow-xs w-full max-w-full min-w-0">
      {/* Mobile Filter Layout (< 768px) */}
      <div className="md:hidden space-y-3">
        {/* Search Input */}
        <div className="w-full">
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />}
            className="h-10 text-xs"
          />
        </div>

        {/* Quick Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => onStatusChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#2563EB] text-white'
                : 'bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('open')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              statusFilter === 'open'
                ? 'bg-[#2563EB] text-white'
                : 'bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]'
            }`}
          >
            Open
          </button>

          <button
            type="button"
            onClick={() => setIsBottomSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-slate-50 dark:bg-[#172033] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs shrink-0 transition-colors ml-auto cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Filter Layout (>= 768px) */}
      <div className="hidden md:block space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
              Search
            </label>
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />}
            />
          </div>

          {/* Course Selector Dropdown */}
          {onCourseChange && (
            <div>
              <label className="block text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                Course
              </label>
              <select
                value={selectedCourseId || ''}
                onChange={(e) => onCourseChange(e.target.value ? e.target.value : null)}
                className="w-full h-9 rounded-lg border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] cursor-pointer text-xs"
              >
                <option value="">All Courses</option>
                {coursesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full h-9 rounded-lg border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] cursor-pointer text-xs"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full h-9 rounded-lg border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] cursor-pointer text-xs"
            >
              {STATUSES.map((st) => (
                <option key={st.id} value={st.id} className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full h-9 rounded-lg border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] cursor-pointer text-xs"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#263244] text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8] font-semibold">
              <Filter className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
              <span>Created By:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['all', 'instructor', 'student'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => onCreatedByChange(role)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold capitalize transition-colors cursor-pointer ${
                    createdByFilter === role
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-7 text-[11px] font-semibold text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#172033]"
            leftIcon={<RotateCcw className="w-3 h-3 text-[#64748B] dark:text-[#94A3B8]" />}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET FOR FILTERS */}
      {isBottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden bg-[#0F172A]/60 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setIsBottomSheetOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#111827] border-t border-[#E2E8F0] dark:border-[#263244] rounded-t-2xl p-4 sm:p-5 space-y-4 max-h-[85vh] overflow-y-auto z-10 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#263244]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                <h3 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-sm">Filters</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBottomSheetOpen(false)}
                className="p-1 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course Selector on Mobile */}
            {onCourseChange && (
              <div>
                <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] mb-1.5">
                  Course
                </label>
                <select
                  value={selectedCourseId || ''}
                  onChange={(e) => onCourseChange(e.target.value ? e.target.value : null)}
                  className="w-full h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                >
                  <option value="">All Courses</option>
                  {coursesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
              >
                {STATUSES.map((st) => (
                  <option key={st.id} value={st.id} className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] mb-1.5">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
              <Button
                variant="outline"
                onClick={() => {
                  onReset();
                  setIsBottomSheetOpen(false);
                }}
                className="flex-1 h-10 text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]"
              >
                Reset
              </Button>
              <Button
                onClick={() => setIsBottomSheetOpen(false)}
                className="flex-1 h-10 text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

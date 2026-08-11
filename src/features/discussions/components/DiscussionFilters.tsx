import React, { useState } from 'react';
import { Search, Filter, RotateCcw, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export interface DiscussionFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
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
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'most_replies', label: 'Most Replies' },
  { id: 'most_active', label: 'Most Active' },
  { id: 'recently_updated', label: 'Recently Updated' },
];

export const DiscussionFilters: React.FC<DiscussionFiltersProps> = ({
  searchQuery,
  onSearchChange,
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
    (selectedCategory !== 'All' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0) +
    (createdByFilter !== 'all' ? 1 : 0);

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 sm:p-4 space-y-3 font-sans text-xs text-left shadow-xs w-full max-w-full min-w-0">
      {/* Mobile Filter Layout (< 768px) */}
      <div className="md:hidden space-y-3">
        {/* Search Input */}
        <div className="w-full">
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="h-10 text-xs"
          />
        </div>

        {/* Quick Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {/* Quick status pills */}
          <button
            type="button"
            onClick={() => onStatusChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('open')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
              statusFilter === 'open'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Answered
          </button>

          {/* Filter Bottom Sheet Trigger Button */}
          <button
            type="button"
            onClick={() => setIsBottomSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs shrink-0 transition-colors ml-auto cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-extrabold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Filter Layout (>= 768px) */}
      <div className="hidden md:block space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-slate-600 font-semibold">
              <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Created By:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['all', 'instructor', 'student'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => onCreatedByChange(role)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition-colors ${
                    createdByFilter === role
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            className="h-7 text-[11px] font-semibold text-slate-600"
            leftIcon={<RotateCcw className="w-3 h-3" />}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET FOR FILTERS */}
      {isBottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden bg-slate-900/50 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setIsBottomSheetOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl p-4 sm:p-5 space-y-4 max-h-[85vh] overflow-y-auto z-10 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Filters</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBottomSheetOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {STATUSES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Created By Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Created By
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'instructor', 'student'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => onCreatedByChange(role)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      createdByFilter === role
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  onReset();
                  setIsBottomSheetOpen(false);
                }}
                className="flex-1 h-10 text-xs font-bold text-slate-700"
              >
                Reset
              </Button>
              <Button
                onClick={() => setIsBottomSheetOpen(false)}
                className="flex-1 h-10 text-xs font-bold bg-[#2563EB] text-white"
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

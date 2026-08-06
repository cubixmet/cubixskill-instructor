import React from 'react';
import { Search, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

export interface AnnouncementFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

export const AnnouncementFilters: React.FC<AnnouncementFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  onReset,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 font-sans text-xs text-left">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search announcements by title, summary, or content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            size="sm"
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Drafts</option>
            <option value="pinned">Pinned Top</option>
            <option value="archived">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="Exam & Quiz">Exam &amp; Quiz</option>
            <option value="Assignment">Assignment</option>
            <option value="Schedule">Schedule</option>
            <option value="Important">Important</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_read">Most Read Rate</option>
            <option value="recently_updated">Recently Updated</option>
          </select>

          {/* Reset */}
          <button
            type="button"
            onClick={onReset}
            className="h-9 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

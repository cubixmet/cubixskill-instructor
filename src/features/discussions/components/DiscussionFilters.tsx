import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
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
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 font-sans text-xs text-left shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search discussions by title, content or author..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            size="sm"
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

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-600">Created By:</span>
          <div className="flex items-center gap-1.5">
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
  );
};

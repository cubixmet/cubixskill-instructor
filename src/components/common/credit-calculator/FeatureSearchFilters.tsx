import React from 'react';
import { Search, RotateCcw, Sparkles, X } from 'lucide-react';
import type { FeatureCategoryName } from './types';
import { CATEGORIES } from './featureData';

interface FeatureSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: FeatureCategoryName | 'All';
  onCategoryChange: (cat: FeatureCategoryName | 'All') => void;
  showSelectedOnly: boolean;
  onToggleShowSelectedOnly: () => void;
  totalSelectedCount: number;
  totalFeaturesCount: number;
  onSelectRecommended: () => void;
  onClearOptional: () => void;
}

export const FeatureSearchFilters: React.FC<FeatureSearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  showSelectedOnly,
  onToggleShowSelectedOnly,
  totalSelectedCount,
  totalFeaturesCount,
  onSelectRecommended,
  onClearOptional,
}) => {
  return (
    <div className="w-full max-w-none overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs text-left">
      <div className="flex flex-col gap-3.5 w-full">
        {/* =========================================================================
           TOP ROW: Search Input (flex-1) | Selected Count | Recommended | Clear
           ========================================================================= */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full min-w-0">
          {/* Search Input Container */}
          <div className="relative flex-1 min-w-0 min-w-[260px] lg:min-w-[320px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search course features…"
              className="w-full h-10 pl-9 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 hover:border-slate-300 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Group */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Selected Count Badge */}
            <span className="h-10 px-3 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200/60 flex items-center justify-center shrink-0 whitespace-nowrap">
              {totalSelectedCount} of {totalFeaturesCount} selected
            </span>

            <div className="flex items-center gap-2 shrink-0">
              {/* Clear Optional Button */}
              <button
                type="button"
                onClick={onClearOptional}
                className="h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                title="Clear optional features (Base student credit remains active)"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span>Clear Optional</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
           BOTTOM ROW: Category Chips (flex-1) | Show Selected Only Switch
           ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100 w-full min-w-0">
          {/* Category Chips Container */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => onCategoryChange('All')}
              className={`h-9 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap flex items-center justify-center ${
                activeCategory === 'All'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`h-9 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap flex items-center justify-center ${
                  activeCategory === cat
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Show Selected Only Switch Container */}
          <div
            onClick={onToggleShowSelectedOnly}
            className="flex items-center justify-between lg:justify-end gap-2.5 h-9 px-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60 cursor-pointer shrink-0 select-none transition-colors w-full lg:w-auto"
          >
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Show selected only
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={showSelectedOnly}
              aria-label="Show selected only"
              onClick={(e) => {
                e.stopPropagation();
                onToggleShowSelectedOnly();
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showSelectedOnly ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  showSelectedOnly ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

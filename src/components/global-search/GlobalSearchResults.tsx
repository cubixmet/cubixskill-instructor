import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, SearchX, Sparkles } from 'lucide-react';
import type { GroupedSearchResults, GlobalSearchResultItem } from './global-search.types';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/cn';

export interface GlobalSearchResultsProps {
  query: string;
  results: GroupedSearchResults[];
  totalResultsCount: number;
  isLoading?: boolean;
  onSelectResult?: () => void;
  selectedIndex?: number;
  onHoverIndex?: (index: number) => void;
}

export const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({
  query,
  results,
  totalResultsCount,
  isLoading = false,
  onSelectResult,
  selectedIndex = -1,
  onHoverIndex,
}) => {
  const navigate = useNavigate();

  const handleNavigate = (item: GlobalSearchResultItem) => {
    if (onSelectResult) onSelectResult();
    navigate(item.route);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3 animate-pulse text-left font-sans">
        <div className="h-3 bg-slate-200 rounded-md w-24" />
        <div className="h-12 bg-slate-100 rounded-xl w-full" />
        <div className="h-12 bg-slate-100 rounded-xl w-full" />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="p-5 text-center text-slate-500 font-sans space-y-2">
        <Sparkles className="w-6 h-6 mx-auto text-blue-500" />
        <p className="text-xs font-semibold text-slate-900">
          Search across your Academy
        </p>
        <p className="text-[11px] text-slate-500">
          Find courses, students, assignments, quizzes, live classes, staff, and media assets instantly.
        </p>
      </div>
    );
  }

  if (totalResultsCount === 0) {
    return (
      <div className="p-6 text-center text-slate-500 font-sans space-y-2">
        <SearchX className="w-8 h-8 mx-auto text-slate-400" />
        <p className="text-xs font-bold text-slate-900">
          No results found for &ldquo;<span className="text-blue-600">{query}</span>&rdquo;
        </p>
        <p className="text-[11px] text-slate-500">
          Check for typos or try searching with different keywords or entity names.
        </p>
      </div>
    );
  }

  let flatIndexCounter = 0;

  return (
    <div className="max-h-[70vh] overflow-y-auto no-scrollbar py-2 text-left font-sans divide-y divide-slate-100">
      {results.map((group) => (
        <div key={group.category} className="py-2 first:pt-0 last:pb-0">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {group.categoryLabel}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
              {group.items.length}
            </span>
          </div>

          <div className="space-y-0.5 mt-1">
            {group.items.map((item) => {
              const IconComponent = item.icon;
              const currentIndex = flatIndexCounter++;
              const isSelected = selectedIndex === currentIndex;

              return (
                <button
                  key={`${item.category}-${item.id || 'item'}-${currentIndex}`}
                  type="button"
                  onClick={() => handleNavigate(item)}
                  onMouseEnter={() => onHoverIndex && onHoverIndex(currentIndex)}
                  className={cn(
                    'w-full px-3 py-2 flex items-center justify-between rounded-xl transition-all text-left cursor-pointer group',
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-800'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={cn(
                        'p-2 rounded-xl shrink-0 transition-colors',
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                      )}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate leading-tight">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.badge && (
                      <Badge variant={item.badgeVariant || 'secondary'} size="sm">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

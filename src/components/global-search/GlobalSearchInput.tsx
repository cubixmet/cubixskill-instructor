import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface GlobalSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  isLoading?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const GlobalSearchInput: React.FC<GlobalSearchInputProps> = ({
  value,
  onChange,
  onClear,
  onFocus,
  isLoading = false,
  autoFocus = false,
  placeholder = 'Search courses, students, assignments...',
  className,
  inputRef,
}) => {
  return (
    <div className={cn('relative w-full text-left font-sans', className)}>
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label="Global Search"
        className="w-full h-9 pl-9 pr-16 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs"
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-auto">
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (onClear) onClear();
            }}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-200/50 border border-slate-300/60 rounded-md">
            <span>⌘</span>K
          </kbd>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ mode, onChange, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#263244] rounded-xl shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
          mode === 'grid'
            ? 'bg-white dark:bg-[#2563EB] text-[#2563EB] dark:text-white shadow-2xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Grid View"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => onChange('list')}
        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
          mode === 'list'
            ? 'bg-white dark:bg-[#2563EB] text-[#2563EB] dark:text-white shadow-2xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="List View"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};

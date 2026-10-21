import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : undefined;
  const endItem =
    totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : undefined;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-2 sm:px-4 text-xs font-sans border-t border-slate-200 dark:border-[#263244] w-full min-w-0 ${className}`}
    >
      {/* Item info (Desktop) */}
      <div className="text-slate-500 dark:text-[#94A3B8] font-medium text-center sm:text-left">
        {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{startItem}</strong> to{' '}
            <strong className="text-slate-900 dark:text-white">{endItem}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          aria-label="Previous page"
          onClick={() => onPageChange(currentPage - 1)}
          className="h-11 min-w-11 sm:h-9 sm:min-w-0 px-2.5 text-xs font-medium"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Compact Page Number Display */}
        <span className="px-2 sm:px-3 text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          onClick={() => onPageChange(currentPage + 1)}
          className="h-11 min-w-11 sm:h-9 sm:min-w-0 px-2.5 text-xs font-medium"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </Button>
      </div>
    </div>
  );
};


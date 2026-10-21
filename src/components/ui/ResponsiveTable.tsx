import React from "react";
import { cn } from "../../lib/cn";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  priority?: "high" | "medium" | "low";
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
  mobileCardRender?: (item: T, index: number) => React.ReactNode;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyState,
  isLoading = false,
  onRowClick,
  className,
  mobileCardRender,
}: ResponsiveTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full space-y-3 py-4 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-xl w-full" />
        <div className="h-14 bg-slate-50 rounded-xl w-full" />
        <div className="h-14 bg-slate-50 rounded-xl w-full" />
        <div className="h-14 bg-slate-50 rounded-xl w-full" />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div className="w-full py-6">{emptyState}</div>;
  }

  return (
    <div className={cn("w-full min-w-0 text-left font-sans", className)}>
      {/* Mobile Card List View (<640px) */}
      <div className="block sm:hidden space-y-3">
        {data.map((item, index) => {
          if (mobileCardRender) {
            return (
              <div key={keyExtractor(item, index)}>
                {mobileCardRender(item, index)}
              </div>
            );
          }

          // Fallback Default Card Render
          return (
            <div
              key={keyExtractor(item, index)}
              onClick={() => onRowClick && onRowClick(item)}
              className={cn(
                "p-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#263244] rounded-2xl shadow-xs space-y-2.5 transition-all",
                onRowClick && "active:scale-[0.99] cursor-pointer hover:border-blue-300"
              )}
            >
              {columns.map((col, colIdx) => {
                if (col.hideOnMobile) return null;
                const value = col.cell
                  ? col.cell(item, index)
                  : col.accessorKey
                  ? String(item[col.accessorKey] ?? "")
                  : null;

                if (colIdx === 0) {
                  return (
                    <div
                      key={colIdx}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-[#263244] pb-2 flex flex-wrap items-start justify-between gap-2"
                    >
                      <span>{col.header}</span>
                      <span>{value}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={colIdx}
                    className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-300 py-0.5"
                  >
                    <span className="font-medium text-slate-400">{col.header}:</span>
                    <span className="min-w-0 break-words [overflow-wrap:anywhere] font-semibold text-slate-800 dark:text-slate-100 text-right">{value}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Desktop & Tablet Responsive Scroll Table (>=640px) */}
      <div role="region" aria-label="Data table" tabIndex={0} className="hidden sm:block w-full min-w-0 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/90">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                onClick={() => onRowClick && onRowClick(item)}
                className={cn(
                  "hover:bg-slate-50/70 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={cn("px-4 py-3.5 whitespace-nowrap", col.className)}>
                    {col.cell
                      ? col.cell(item, index)
                      : col.accessorKey
                      ? String(item[col.accessorKey] ?? "")
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


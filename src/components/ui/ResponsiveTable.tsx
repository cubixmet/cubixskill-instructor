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
      <div className="w-full space-y-3 py-4 animate-pulse" aria-busy="true" aria-label="Loading table">
        <div className="h-10 bg-[var(--surface-hover)] rounded-[var(--radius-sm)] w-full" />
        <div className="h-14 bg-[var(--surface-secondary)] rounded-[var(--radius-sm)] w-full" />
        <div className="h-14 bg-[var(--surface-secondary)] rounded-[var(--radius-sm)] w-full" />
        <div className="h-14 bg-[var(--surface-secondary)] rounded-[var(--radius-sm)] w-full" />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div className="w-full py-6">{emptyState}</div>;
  }

  return (
    <div className={cn("w-full text-left", className)}>
      <div className="block sm:hidden space-y-3">
        {data.map((item, index) => {
          if (mobileCardRender) {
            return <div key={keyExtractor(item, index)}>{mobileCardRender(item, index)}</div>;
          }

          return (
            <div
              key={keyExtractor(item, index)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-[var(--shadow-card)] space-y-2.5 transition-[transform,border-color,background-color]",
                onRowClick && "active:scale-[0.99] cursor-pointer hover:border-[var(--primary-border)]"
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
                      className="font-semibold text-sm text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center justify-between gap-3"
                    >
                      <span className="text-[var(--text-muted)] text-xs font-medium">{col.header}</span>
                      <span className="text-right">{value}</span>
                    </div>
                  );
                }

                return (
                  <div key={colIdx} className="flex items-center justify-between gap-3 text-xs py-0.5">
                    <span className="font-medium text-[var(--text-muted)]">{col.header}:</span>
                    <span className="font-medium text-[var(--text-secondary)] text-right">{value}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[var(--surface-secondary)] border-b border-[var(--border)]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] whitespace-nowrap",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-sm font-normal text-[var(--text-secondary)]">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "transition-colors hover:bg-[var(--surface-hover)]",
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

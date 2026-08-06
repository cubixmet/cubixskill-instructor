import React from "react";
import { cn } from "../../lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, circle = false, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200/80 rounded-2xl",
        circle && "rounded-full",
        className
      )}
      {...props}
    />
  );
};

export const SkeletonCard: React.FC<{ rows?: number; className?: string }> = ({
  rows = 3,
  className,
}) => {
  return (
    <div className={cn("p-6 bg-white rounded-2xl border border-slate-200/80 space-y-4 animate-pulse text-left", className)}>
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-xl" circle={false} />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <Skeleton key={idx} className="h-3.5 w-full" />
        ))}
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden text-left">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center space-x-3 flex-1">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

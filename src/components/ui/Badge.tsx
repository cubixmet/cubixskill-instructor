import React from "react";
import { cn } from "../../lib/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "neutral" | "primary" | "secondary";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  ...props
}) => {
  const variantClasses = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    warning: "bg-amber-50 text-amber-700 border-amber-200/60",
    error: "bg-rose-50 text-rose-700 border-rose-200/60",
    info: "bg-sky-50 text-sky-700 border-sky-200/60",
    neutral: "bg-slate-100 text-slate-700 border-slate-200/60",
    secondary: "bg-slate-100 text-slate-700 border-slate-200/60",
    primary: "bg-blue-50 text-blue-700 border-blue-200/60",
  };

  const dotClasses = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-rose-500",
    info: "bg-sky-500",
    neutral: "bg-slate-400",
    secondary: "bg-slate-400",
    primary: "bg-blue-500",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium gap-1",
    md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-transparent tracking-tight shrink-0 select-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClasses[variant])}
        />
      )}
      <span>{children}</span>
    </span>
  );
};

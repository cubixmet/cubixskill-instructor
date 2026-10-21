import React from "react";
import { cn } from "../../lib/cn";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  size?: "sm" | "md" | "lg" | number;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      helperText,
      className,
      id,
      size = "md",
      type = "text",
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const sizeClasses = {
      sm: "h-11 min-h-[44px] sm:h-9 sm:min-h-[36px] text-xs px-3 rounded-lg",
      md: "h-[46px] min-h-[46px] text-[14px] sm:text-[15px] px-3.5 rounded-[10px]",
      lg: "h-[50px] min-h-[50px] text-base px-4 rounded-[10px]",
    };

    const currentSizeClass = typeof size === "string" ? sizeClasses[size] || sizeClasses.md : sizeClasses.md;
    const htmlSize = typeof size === "number" ? size : undefined;

    const errorId = `${inputId}-error`;

    return (
      <div className="w-full min-w-0 space-y-1.5 text-left font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] sm:text-[14px] font-medium text-[#475569] dark:text-[#CBD5E1]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full min-w-0">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-[#64748B] dark:text-[#94A3B8] shrink-0">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            size={htmlSize}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full bg-[#FFFFFF] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] font-normal border border-[#CBD5E1] dark:border-[#334155] transition-all duration-200 focus:outline-none focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:opacity-60 shadow-2xs min-w-0",
              currentSizeClass,
              leftIcon && (size === "sm" ? "pl-9" : "pl-10"),
              rightIcon && (size === "sm" ? "pr-9" : "pr-10"),
              error && "border-rose-500 dark:border-rose-500/80 focus:border-rose-600 focus:ring-rose-500/10 bg-rose-50/20 dark:bg-rose-900/10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#64748B] dark:text-[#94A3B8]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} role="alert" aria-live="polite" className="text-[12px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";


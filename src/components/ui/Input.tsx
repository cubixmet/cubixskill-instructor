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
      sm: "h-9 min-h-[36px] text-xs px-3 rounded-[10px]",
      md: "h-[48px] min-h-[48px] text-[14px] px-4 rounded-[12px]",
      lg: "h-[52px] min-h-[52px] text-base px-4 rounded-[12px]",
    };

    const currentSizeClass = typeof size === "string" ? sizeClasses[size] || sizeClasses.md : sizeClasses.md;
    const htmlSize = typeof size === "number" ? size : undefined;

    const errorId = `${inputId}-error`;

    return (
      <div className="w-full space-y-1.5 text-left font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[14px] font-medium text-[#0F172A]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-[#64748B] shrink-0">
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
              "w-full bg-white text-[#0F172A] placeholder:text-[#64748B] font-normal border border-[#E2E8F0] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] disabled:bg-slate-50 disabled:opacity-60 shadow-xs",
              currentSizeClass,
              leftIcon && (size === "sm" ? "pl-9" : "pl-10"),
              rightIcon && (size === "sm" ? "pr-9" : "pr-10"),
              error && "border-rose-500 ring-1 ring-rose-500/20 focus:ring-rose-500/20 focus:border-rose-600 bg-rose-50/10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#64748B]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} role="alert" aria-live="polite" className="text-[12px] font-medium text-rose-600 flex items-center gap-1 mt-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[13px] font-normal text-[#64748B] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

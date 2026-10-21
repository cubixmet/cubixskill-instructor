import React from "react";
import { cn } from "../../lib/cn";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
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
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const sizeClasses = {
      sm: "h-9 min-h-9 text-xs px-3 rounded-[var(--radius-sm)]",
      md: "h-11 min-h-11 text-sm px-3.5 rounded-[var(--radius-sm)]",
      lg: "h-12 min-h-12 text-[15px] px-4 rounded-[var(--radius-md)]",
    };

    const currentSizeClass = typeof size === "string" ? sizeClasses[size] || sizeClasses.md : sizeClasses.md;
    const htmlSize = typeof size === "number" ? size : undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] sm:text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full min-w-0">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-[var(--text-muted)] shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            size={htmlSize}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              "w-full min-w-0 bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-normal border border-[var(--input-border)] shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,background-color] duration-150 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:bg-[var(--surface-secondary)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-70",
              currentSizeClass,
              leftIcon && (size === "sm" ? "pl-9" : "pl-10"),
              rightIcon && (size === "sm" ? "pr-9" : "pr-10"),
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/30 dark:bg-rose-950/10",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-[var(--text-muted)]">{rightIcon}</div>
          )}
        </div>

        {error ? (
          <p id={errorId} role="alert" aria-live="polite" className="text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs font-normal text-[var(--text-muted)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

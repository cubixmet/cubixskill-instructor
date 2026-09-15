import React from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { Spinner } from "./Spinner";
import { cn } from "../../lib/cn";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  isSuccess?: boolean;
  isError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isIconOnly?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      isSuccess = false,
      isError = false,
      isIconOnly = false,
      fullWidth = false,
      disabled,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-150 select-none cursor-pointer border focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:pointer-events-none";

    const variantClasses = {
      primary:
        "bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] border-transparent hover:bg-[var(--brand-primary-hover)] shadow-[0_7px_18px_rgba(37,99,235,0.16)]",
      secondary:
        "bg-[var(--surface)] text-[var(--text-primary)] border-[var(--border-strong)] hover:bg-[var(--surface-hover)] shadow-[var(--shadow-xs)]",
      outline:
        "bg-transparent text-[var(--text-primary)] border-[var(--border-strong)] hover:bg-[var(--surface-hover)]",
      ghost:
        "bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
      danger:
        "bg-rose-600 text-white border-transparent hover:bg-rose-700 shadow-[0_7px_18px_rgba(225,29,72,0.14)]",
    };

    const sizeClasses = {
      xs: "h-8 px-3 text-xs gap-1.5 rounded-[var(--radius-sm)]",
      sm: "h-9 px-3.5 text-sm gap-2 rounded-[var(--radius-sm)]",
      md: "h-11 px-4 sm:px-5 text-sm gap-2 rounded-[var(--radius-sm)]",
      lg: "h-12 px-5 sm:px-6 text-[15px] gap-2.5 rounded-[var(--radius-md)]",
    };

    const iconOnlyClasses = {
      xs: "size-8 min-w-8 p-0 rounded-[var(--radius-sm)]",
      sm: "size-9 min-w-9 p-0 rounded-[var(--radius-sm)]",
      md: "size-11 min-w-11 p-0 rounded-[var(--radius-sm)]",
      lg: "size-12 min-w-12 p-0 rounded-[var(--radius-md)]",
    };

    const statusClasses = isSuccess
      ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-none"
      : isError
      ? "bg-rose-600 hover:bg-rose-700 text-white border-transparent shadow-none"
      : undefined;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        whileTap={disabled || isLoading ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        className={cn(
          baseClasses,
          variantClasses[variant],
          isIconOnly ? iconOnlyClasses[size] : sizeClasses[size],
          fullWidth && "w-full",
          statusClasses,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner
              size="sm"
              className={variant === "primary" || variant === "danger" || isSuccess || isError ? "text-white" : "text-[var(--brand-primary)]"}
            />
            {loadingText && <span>{loadingText}</span>}
          </span>
        ) : isSuccess ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Check className="size-4.5 shrink-0 stroke-[2.5]" />
            <span>Success</span>
          </span>
        ) : isError ? (
          <span className="inline-flex items-center justify-center gap-2">
            <AlertCircle className="size-4.5 shrink-0" />
            <span>Error</span>
          </span>
        ) : (
          <>
            {leftIcon && <span className="inline-flex size-[18px] shrink-0 items-center justify-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex size-[18px] shrink-0 items-center justify-center">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

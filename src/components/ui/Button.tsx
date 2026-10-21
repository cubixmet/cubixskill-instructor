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
      xs: "h-[44px] sm:h-[32px] px-[12px] text-xs gap-[6px] min-w-0 rounded-[8px]",
      sm: "h-[44px] sm:h-[38px] px-[14px] text-sm gap-[8px] min-w-[100px]",
      md: "h-[44px] sm:h-[48px] px-[20px] text-[14px] sm:text-[15px] gap-[8px] min-w-[130px]",
      lg: "h-[48px] sm:h-[52px] px-[24px] text-base gap-[10px] min-w-[150px]",
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


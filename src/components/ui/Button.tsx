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
      "inline-flex flex-row items-center justify-center font-medium rounded-[9px] transition-all duration-200 focus:outline-none focus-visible:outline-none select-none cursor-pointer text-[14px] sm:text-[15px] leading-none whitespace-nowrap flex-nowrap shrink-0 disabled:cursor-not-allowed disabled:shadow-none disabled:border-transparent disabled:hover:scale-100 disabled:hover:translate-y-0";

    const variantClasses = {
      primary:
        "bg-[#2563EB] text-[#FFFFFF] hover:bg-[#1D4ED8] focus:bg-[#1D4ED8] focus:ring-4 focus:ring-[#3B82F6]/30 shadow-[0_4px_12px_rgba(37,99,235,0.15)] border border-transparent disabled:bg-[#2563EB]/60 disabled:text-white/80",
      secondary:
        "bg-[#FFFFFF] dark:bg-[#111827] text-[#0F172A] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/20",
      outline:
        "bg-[#FFFFFF] dark:bg-[#111827] text-[#0F172A] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/20",
      ghost:
        "bg-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] border border-transparent",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600 shadow-md shadow-rose-600/20 border border-transparent",
    };

    const sizeClasses = {
      xs: "h-[44px] sm:h-[32px] px-[12px] text-xs gap-[6px] min-w-0 rounded-[8px]",
      sm: "h-[44px] sm:h-[38px] px-[14px] text-sm gap-[8px] min-w-[100px]",
      md: "h-[44px] sm:h-[48px] px-[20px] text-[14px] sm:text-[15px] gap-[8px] min-w-[130px]",
      lg: "h-[48px] sm:h-[52px] px-[24px] text-base gap-[10px] min-w-[150px]",
    };

    const iconOnlyClasses = "w-[44px] h-[44px] min-w-[44px] min-h-[44px] p-0 rounded-[9px] flex flex-row items-center justify-center shrink-0";

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        whileHover={disabled || isLoading ? undefined : { scale: 1.01 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.99 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          baseClasses,
          variantClasses[variant],
          isIconOnly ? iconOnlyClasses : sizeClasses[size],
          fullWidth && "w-full min-w-full",
          isSuccess && "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-none",
          isError && "bg-rose-600 hover:bg-rose-700 text-white border-transparent shadow-none",
          className
        )}
        {...props}
      >
        {/* Loading Spinner State */}
        {isLoading ? (
          <span className="inline-flex flex-row items-center justify-center gap-[8px] whitespace-nowrap flex-nowrap shrink-0">
            <Spinner
              size="sm"
              className={variant === "primary" || variant === "danger" || isSuccess || isError ? "text-white" : "text-[#2563EB] dark:text-[#60A5FA]"}
            />
            {loadingText && <span className="whitespace-nowrap shrink-0 leading-none">{loadingText}</span>}
          </span>
        ) : isSuccess ? (
          <span className="inline-flex flex-row items-center justify-center gap-[8px] whitespace-nowrap flex-nowrap shrink-0">
            <Check className="w-[18px] h-[18px] stroke-[3] shrink-0" />
            <span className="whitespace-nowrap shrink-0 leading-none">Success</span>
          </span>
        ) : isError ? (
          <span className="inline-flex flex-row items-center justify-center gap-[8px] whitespace-nowrap flex-nowrap shrink-0">
            <AlertCircle className="w-[18px] h-[18px] shrink-0" />
            <span className="whitespace-nowrap shrink-0 leading-none">Error</span>
          </span>
        ) : (
          <span className="inline-flex flex-row items-center justify-center gap-[8px] whitespace-nowrap flex-nowrap shrink-0">
            {leftIcon && (
              <span className="inline-flex shrink-0 items-center justify-center w-[18px] h-[18px]">
                {leftIcon}
              </span>
            )}
            {typeof children === "string" ? (
              <span className="whitespace-nowrap shrink-0 leading-none">{children}</span>
            ) : (
              <span className="inline-flex flex-row items-center justify-center gap-[8px] whitespace-nowrap flex-nowrap shrink-0">
                {children}
              </span>
            )}
            {rightIcon && (
              <span className="inline-flex shrink-0 items-center justify-center w-[18px] h-[18px]">
                {rightIcon}
              </span>
            )}
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";


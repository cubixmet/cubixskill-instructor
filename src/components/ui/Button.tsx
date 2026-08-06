import React from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { Spinner } from "./Spinner";
import { cn } from "../../lib/cn";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
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
    // CubixSkill Global Button Design System Standards:
    // Primary: #2563EB, Hover #1D4ED8, Text White, Soft blue shadow
    // Height: Desktop 48px, Mobile 46px. Radius: 14px. Padding: 0 20px. Min-width: 140px.
    // Font: Inter 15px 600. Icon: 18px. Icon Gap: 8px. Always flex-row horizontal line!
    const baseClasses =
      "inline-flex flex-row items-center justify-center font-semibold rounded-[14px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none cursor-pointer text-[15px] leading-none whitespace-nowrap flex-nowrap shrink-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:border-transparent disabled:hover:scale-100 disabled:hover:translate-y-0";

    const variantClasses = {
      primary:
        "bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-[#2563EB] shadow-md shadow-[#2563EB]/25 border border-transparent hover:-translate-y-[1px]",
      secondary:
        "bg-white text-[#2563EB] border border-[#2563EB] hover:bg-[#EFF6FF] focus:ring-[#2563EB] hover:-translate-y-[1px]",
      outline:
        "bg-transparent text-[#2563EB] border border-[#2563EB] hover:bg-[#EFF6FF] focus:ring-[#2563EB] hover:-translate-y-[1px]",
      ghost:
        "bg-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 focus:ring-slate-400 border border-transparent",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600 shadow-md shadow-rose-600/20 border border-transparent hover:-translate-y-[1px]",
    };

    const sizeClasses = {
      sm: "h-[40px] px-[16px] text-sm gap-[8px] min-w-[110px]",
      md: "h-[46px] sm:h-[48px] px-[20px] text-[15px] gap-[8px] min-w-[140px]",
      lg: "h-[52px] px-[24px] text-base gap-[10px] min-w-[160px]",
    };

    const iconOnlyClasses = "w-[44px] h-[44px] min-w-[44px] min-h-[44px] p-0 rounded-[12px] flex flex-row items-center justify-center shrink-0";

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
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
              className={variant === "primary" || variant === "danger" || isSuccess || isError ? "text-white" : "text-[#2563EB]"}
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

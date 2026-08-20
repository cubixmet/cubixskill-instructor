import React from "react";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/cn";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "w-full max-w-full rounded-xl border flex flex-col items-center justify-center text-center",
        "py-8 px-4 sm:py-14 sm:px-12 my-4",
        "bg-white border-slate-200 text-slate-900",
        "dark:bg-[#111827] dark:border-[#263244] dark:text-[#F8FAFC]",
        "shadow-[0_0_0_1px_rgba(37,99,235,0.04),0_6px_18px_rgba(37,99,235,0.05)]",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#263244]">
        <Icon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
        {title}
      </h3>

      <p className="text-xs sm:text-sm font-normal text-[#64748B] dark:text-[#94A3B8] max-w-md mb-5 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          leftIcon={actionIcon}
          size="sm"
          className="w-full sm:w-auto max-w-[220px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium shadow-[0_4_12px_rgba(37,99,235,0.14)]"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

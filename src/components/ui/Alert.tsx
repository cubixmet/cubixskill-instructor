import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "../../lib/cn";

export interface AlertProps {
  type?: "error" | "success" | "info";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = "error",
  title,
  children,
  onClose,
  className,
}) => {
  const styles = {
    error: {
      bg: "bg-[#FEF2F2] dark:bg-[rgba(239,68,68,0.08)] border-[#FECACA] dark:border-[rgba(248,113,113,0.25)] text-[#B91C1C] dark:text-[#FCA5A5]",
      icon: <AlertCircle className="w-5 h-5 text-[#EF4444] dark:text-[#F87171] shrink-0" />,
    },
    success: {
      bg: "bg-[#ECFDF5] dark:bg-[rgba(16,185,129,0.08)] border-[#A7F3D0] dark:border-[rgba(52,211,153,0.24)] text-[#047857] dark:text-[#6EE7B7]",
      icon: <CheckCircle2 className="w-5 h-5 text-[#10B981] dark:text-[#6EE7B7] shrink-0" />,
    },
    info: {
      bg: "bg-[#EFF6FF] dark:bg-[rgba(59,130,246,0.08)] border-[#BFDBFE] dark:border-[rgba(96,165,250,0.25)] text-[#1E40AF] dark:text-[#93C5FD]",
      icon: <Info className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />,
    },
  };

  const current = styles[type];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-200",
        current.bg,
        className
      )}
    >
      {current.icon}
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="leading-relaxed break-words">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:opacity-75 transition-opacity rounded-lg cursor-pointer"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

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
      bg: "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]",
      icon: <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />,
    },
    success: {
      bg: "bg-[#F0FDF4] border-[#86EFAC] text-[#166534]",
      icon: <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />,
    },
    info: {
      bg: "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]",
      icon: <Info className="w-5 h-5 text-[#2563EB] shrink-0" />,
    },
  };

  const current = styles[type];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border text-sm font-medium transition-all duration-200",
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
          className="p-1 hover:opacity-75 transition-opacity rounded-lg"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

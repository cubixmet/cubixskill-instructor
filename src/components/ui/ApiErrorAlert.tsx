import React from "react";
import { AlertTriangle, X } from "lucide-react";

export interface ApiErrorAlertProps {
  message?: string | null;
  onClose?: () => void;
  className?: string;
}

export const ApiErrorAlert: React.FC<ApiErrorAlertProps> = ({ message, onClose, className = "" }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`p-3.5 bg-[#FEF2F2] dark:bg-[rgba(239,68,68,0.08)] border border-[#FECACA] dark:border-[rgba(248,113,113,0.25)] text-[#B91C1C] dark:text-[#FCA5A5] rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between animate-fade-in ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertTriangle className="w-4 h-4 text-[#EF4444] dark:text-[#F87171] shrink-0" />
        <span className="truncate">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-[#B91C1C] dark:text-[#FCA5A5] hover:opacity-75 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
          aria-label="Close error"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

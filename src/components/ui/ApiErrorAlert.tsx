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
      className={`p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center justify-between animate-fade-in ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

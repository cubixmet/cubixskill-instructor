import React from 'react';
import { X, ArrowLeft } from 'lucide-react';

export interface AppPopupHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  onBack?: () => void;
  showBackOnMobile?: boolean;
}

export const AppPopupHeader: React.FC<AppPopupHeaderProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  onBack,
  showBackOnMobile = false,
}) => {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-[#1E2B4B] bg-white dark:bg-[#0E1733] shrink-0 sticky top-0 z-20 font-sans">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile Back Button */}
        {showBackOnMobile && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="sm:hidden p-2 -ml-2 rounded-xl text-slate-900 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1A2645] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Optional Header Icon */}
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#142347] text-[#2563EB] dark:text-[#60A5FA] border border-blue-100 dark:border-[#1E305B] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8FAFC] leading-snug truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-xs font-medium text-slate-500 dark:text-[#94A3B8] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-xl text-slate-400 dark:text-[#64748B] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1A2645] transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ml-2 shrink-0"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

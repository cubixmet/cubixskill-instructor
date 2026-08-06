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
    <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E2E8F0] bg-white shrink-0 sticky top-0 z-20 font-sans">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile Back Button */}
        {showBackOnMobile && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="sm:hidden p-2 -ml-2 rounded-xl text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Optional Header Icon */}
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#0F172A] leading-snug truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[13px] sm:text-[14px] font-normal text-[#64748B] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="p-2.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ml-2 shrink-0"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

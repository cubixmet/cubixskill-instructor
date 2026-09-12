import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  maxHeightClass?: string;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actionText,
  onAction,
  maxHeightClass = 'max-h-[55dvh]',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <div
        className={`w-full bg-[#0F172A] border-t border-slate-800 rounded-t-3xl shadow-2xl flex flex-col ${maxHeightClass} overflow-hidden transition-all animate-in slide-in-from-bottom-full duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle & Header Bar */}
        <div className="flex flex-col shrink-0 bg-[#0F172A] border-b border-slate-800/80 px-4 pt-2 pb-3">
          <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">{title}</h3>
            <div className="flex items-center gap-2">
              {actionText && onAction && (
                <button
                  type="button"
                  onClick={onAction}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer min-h-[36px]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{actionText}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
};

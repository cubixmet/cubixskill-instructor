import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface AppResponsiveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  mobileMode?: 'fullscreen' | 'sheet';
  isDirty?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const AppResponsiveForm: React.FC<AppResponsiveFormProps> = ({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  mobileMode = 'fullscreen',
  footer,
  children,
  className = '',
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const sizeClasses = {
    sm: 'max-w-[440px]',
    md: 'max-w-[540px]',
    lg: 'max-w-[740px]',
    xl: 'max-w-[960px]',
    '2xl': 'max-w-[1200px]',
  };

  const isFullScreenMobile = mobileMode === 'fullscreen';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs"
          />

          {/* Form Container */}
          <motion.div
            initial={
              isFullScreenMobile
                ? { y: '100%', opacity: 1 }
                : { opacity: 0, scale: 0.96, y: 20 }
            }
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={
              isFullScreenMobile
                ? { y: '100%', opacity: 1 }
                : { opacity: 0, scale: 0.96, y: 20 }
            }
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className={cn(
              'relative z-10 w-full bg-white flex flex-col text-left overflow-hidden shadow-2xl border border-[#E2E8F0]',
              isFullScreenMobile
                ? 'h-[100dvh] md:h-auto md:max-h-[88vh] rounded-none md:rounded-[20px]'
                : 'rounded-t-[24px] md:rounded-[20px] max-h-[88vh]',
              sizeClasses[size],
              className
            )}
          >
            {/* STICKY TOP HEADER */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 py-3.5 bg-white border-b border-[#E2E8F0] shrink-0 min-h-[56px]">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="p-2 -ml-2 rounded-xl text-[#0F172A] hover:bg-slate-100 transition-colors md:hidden shrink-0 cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-[#0F172A] tracking-tight truncate leading-snug">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-xs text-[#64748B] font-normal mt-0.5 truncate hidden md:block">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCROLLABLE FORM BODY */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-4 no-scrollbar">
              {children}
            </div>

            {/* STICKY BOTTOM FOOTER */}
            {footer && (
              <div className="sticky bottom-0 z-20 px-4 md:px-6 py-3 bg-white border-t border-[#E2E8F0] shrink-0 pb-[calc(12px+env(safe-area-inset-bottom))]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

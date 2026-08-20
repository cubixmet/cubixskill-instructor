import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showClose?: boolean;
  mobileMode?: 'fullscreen' | 'sheet';
  contentPadding?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth: maxWidthProp,
  size,
  showClose = true,
  mobileMode = 'fullscreen',
  contentPadding = 'p-4 sm:p-6',
}) => {
  const maxWidth = size || maxWidthProp || 'md';
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const maxWidthClasses = {
    sm: 'max-w-[440px]',
    md: 'max-w-[540px]',
    lg: 'max-w-[740px]',
    xl: 'max-w-[960px]',
    '2xl': 'max-w-[1200px]',
  };

  const isFullScreenMobile = mobileMode === 'fullscreen';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden font-sans text-left">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs"
          />

          {/* Dialog Container */}
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
              'relative z-10 w-full bg-white dark:bg-[#111827] flex flex-col text-left overflow-hidden shadow-2xl border border-[#E2E8F0] dark:border-[#263244] dark:shadow-[0_0_0_1px_rgba(37,99,235,0.15),0_8px_32px_rgba(0,0,0,0.5)]',
              isFullScreenMobile
                ? 'h-[100dvh] sm:h-auto sm:max-h-[88vh] rounded-none sm:rounded-[20px]'
                : 'rounded-t-[24px] sm:rounded-[20px] max-h-[88vh]',
              maxWidthClasses[maxWidth]
            )}
          >
            {(title || showClose) && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#E2E8F0] dark:border-[#263244] bg-white dark:bg-[#111827] shrink-0 sticky top-0 z-20 min-h-[56px]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="sm:hidden p-2 -ml-1 rounded-xl text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer"
                    aria-label="Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    {title && (
                      <h3 className="text-base sm:text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-snug truncate">
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5 truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {showClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            <div className={cn('overflow-y-auto no-scrollbar flex-1 pb-[calc(16px+env(safe-area-inset-bottom))]', contentPadding)}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

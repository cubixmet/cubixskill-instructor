import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppPopupHeader } from './AppPopupHeader';

export interface AppBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AppBottomSheet: React.FC<AppBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#070D1B]/70 dark:bg-[#040814]/80 backdrop-blur-xs z-50"
          />

          {/* Bottom Sheet Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280, duration: 0.25 }}
            className="relative z-50 w-full max-w-[560px] bg-white dark:bg-[#0E1733] rounded-t-[20px] shadow-2xl border-t border-slate-200 dark:border-[#1E2B4B] overflow-hidden flex flex-col h-auto max-h-[80dvh] text-left"
          >
            {/* Sheet Handle Indicator */}
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-[#25355B] mx-auto mt-2.5 mb-0.5 shrink-0" />

            {title && (
              <AppPopupHeader title={title} subtitle={subtitle} onClose={onClose} />
            )}

            <div className="p-4 sm:p-5 overflow-y-auto no-scrollbar flex-1 pb-[calc(16px+env(safe-area-inset-bottom))] text-xs">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

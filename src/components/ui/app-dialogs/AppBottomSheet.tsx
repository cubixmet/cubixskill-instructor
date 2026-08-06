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
            className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs"
          />

          {/* Bottom Sheet Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280, duration: 0.25 }}
            className="relative z-10 w-full max-w-[560px] bg-white rounded-t-[24px] shadow-2xl border-t border-[#E2E8F0] overflow-hidden flex flex-col max-h-[85vh] text-left"
          >
            {/* Sheet Handle Indicator */}
            <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto mt-3 mb-1" />

            {title && (
              <AppPopupHeader title={title} subtitle={subtitle} onClose={onClose} />
            )}

            <div className="p-5 overflow-y-auto no-scrollbar flex-1 pb-[calc(24px+env(safe-area-inset-bottom))] text-xs">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

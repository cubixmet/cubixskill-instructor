import { createPortal } from 'react-dom';
import { useOverlay } from '../../../hooks/useOverlay';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { AppPopupHeader } from './AppPopupHeader';

export interface AppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showClose?: boolean;
  onBack?: () => void;
}

export const AppDialog: React.FC<AppDialogProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  size = 'md',
  showClose = true,
  onBack,
}) => {
  const panelRef = useOverlay(isOpen, onClose);

  // Standard Desktop Widths
  const sizeClasses = {
    sm: 'max-w-[420px]',
    md: 'max-w-[560px]',
    lg: 'max-w-[680px]',
    xl: 'max-w-[820px]',
    '2xl': 'max-w-[960px]',
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 overflow-y-auto no-scrollbar font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs"
          />

          {/* Dialog Window Container (Desktop Centered / Mobile Full-Screen Drawer) */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || "Dialog"}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn(
              'relative w-full bg-white md:rounded-[20px] shadow-2xl border border-[#E2E8F0] overflow-hidden z-10 text-left flex flex-col',
              'h-[100dvh] md:h-auto max-h-[100dvh] md:max-h-[85vh] rounded-none',
              sizeClasses[size]
            )}
          >
            {(title || showClose) && (
              <AppPopupHeader
                title={title || ''}
                subtitle={subtitle}
                icon={icon}
                onClose={onClose}
                onBack={onBack}
                showBackOnMobile={Boolean(onBack)}
              />
            )}

            <div className="p-4 md:p-6 min-h-0 overflow-y-auto no-scrollbar flex-1 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-sm">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};


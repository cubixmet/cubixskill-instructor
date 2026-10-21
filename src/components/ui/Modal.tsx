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
  const titleId = React.useId();
  const subtitleId = React.useId();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-[440px]',
    md: 'max-w-[560px]',
    lg: 'max-w-[760px]',
    xl: 'max-w-[980px]',
    '2xl': 'max-w-[1200px]',
  };

  const isFullScreenMobile = mobileMode === 'fullscreen';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden text-left">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={subtitle ? subtitleId : undefined}
            initial={isFullScreenMobile ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.98, y: 12 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={isFullScreenMobile ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.98, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              'relative z-10 w-full bg-[var(--surface)] text-[var(--text-primary)] flex flex-col text-left overflow-hidden border border-[var(--border)] shadow-[var(--shadow-elevated)]',
              isFullScreenMobile
                ? 'h-[100dvh] sm:h-auto sm:max-h-[88vh] rounded-none sm:rounded-[var(--radius-xl)]'
                : 'rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] max-h-[88vh]',
              maxWidthClasses[maxWidth]
            )}
          >
            {(title || showClose) && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[var(--border)] bg-[var(--surface)] shrink-0 sticky top-0 z-20 min-h-[58px]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="sm:hidden p-2 -ml-1 rounded-[var(--radius-sm)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                    aria-label="Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="min-w-0">
                    {title && (
                      <h3 id={titleId} className="text-base sm:text-[18px] font-semibold text-[var(--text-primary)] leading-snug truncate">
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p id={subtitleId} className="text-xs sm:text-[13px] text-[var(--text-muted)] font-normal mt-0.5 truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {showClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]"
                    aria-label={title ? `Close ${title}` : 'Close modal'}
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

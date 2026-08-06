import React from 'react';
import { Button } from '../Button';

export interface AppPopupFooterProps {
  onCancel?: () => void;
  cancelLabel?: string;
  onSecondaryAction?: () => void;
  secondaryLabel?: string;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  submitVariant?: 'primary' | 'danger';
  children?: React.ReactNode;
}

export const AppPopupFooter: React.FC<AppPopupFooterProps> = ({
  onCancel,
  cancelLabel = 'Cancel',
  onSecondaryAction,
  secondaryLabel,
  onSubmit,
  submitLabel = 'Save',
  isSubmitting = false,
  submitDisabled = false,
  submitVariant = 'primary',
  children,
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 px-5 sm:px-6 py-4 bg-white border-t border-[#E2E8F0] shrink-0 sticky bottom-0 z-20 font-sans pb-[calc(16px+env(safe-area-inset-bottom))]">
      {children ? (
        children
      ) : (
        <>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto h-[46px] sm:h-[48px] text-[15px] font-semibold border-[#E2E8F0] bg-white text-[#0F172A]"
            >
              {cancelLabel}
            </Button>
          )}

          {onSecondaryAction && secondaryLabel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onSecondaryAction}
              className="w-full sm:w-auto h-[46px] sm:h-[48px] text-[15px] font-semibold"
            >
              {secondaryLabel}
            </Button>
          )}

          {onSubmit && (
            <Button
              type="submit"
              variant={submitVariant}
              onClick={onSubmit}
              isLoading={isSubmitting}
              disabled={submitDisabled || isSubmitting}
              className="w-full sm:w-auto h-[46px] sm:h-[48px] text-[15px] font-semibold px-6 min-w-[140px]"
            >
              {submitLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

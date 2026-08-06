import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { AppDialog } from './AppDialog';
import { AppPopupFooter } from './AppPopupFooter';

export interface AppConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  isConfirming?: boolean;
}

export const AppConfirmDialog: React.FC<AppConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isConfirming = false,
}) => {
  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      icon={
        variant === 'danger' ? (
          <AlertTriangle className="w-5 h-5 text-rose-600" />
        ) : (
          <Info className="w-5 h-5 text-[#2563EB]" />
        )
      }
    >
      <div className="space-y-4 text-left font-sans py-1">
        {itemName && (
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-semibold text-[#0F172A] text-[14px]">
            {itemName}
          </div>
        )}

        <p className="text-[14px] text-[#64748B] font-normal leading-relaxed">
          {description}
        </p>

        <AppPopupFooter
          onCancel={onClose}
          cancelLabel={cancelLabel}
          onSubmit={onConfirm}
          submitLabel={confirmLabel}
          submitVariant={variant === 'danger' ? 'danger' : 'primary'}
          isSubmitting={isConfirming}
        />
      </div>
    </AppDialog>
  );
};

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AppDialog } from './AppDialog';
import { AppPopupFooter } from './AppPopupFooter';

export interface AppUnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDiscard: () => void;
}

export const AppUnsavedChangesDialog: React.FC<AppUnsavedChangesDialogProps> = ({
  isOpen,
  onClose,
  onConfirmDiscard,
}) => {
  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Unsaved Changes"
      size="sm"
      icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
    >
      <div className="space-y-4 text-left font-sans py-1">
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-[13px] font-medium leading-relaxed">
          You have unsaved changes in this form. Closing now will discard all your edits.
        </div>

        <AppPopupFooter
          onCancel={onClose}
          cancelLabel="Keep Editing"
          onSubmit={onConfirmDiscard}
          submitLabel="Discard Changes"
          submitVariant="danger"
        />
      </div>
    </AppDialog>
  );
};

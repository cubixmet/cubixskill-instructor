import React from 'react';

export interface LessonFormActionsProps {
  formId?: string;
  isCreateMode?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
}

export const LessonFormActions: React.FC<LessonFormActionsProps> = ({
  formId = 'lesson-form',
  isCreateMode = true,
  isSaving = false,
  disabled = false,
  onCancel,
  submitLabel,
  cancelLabel = 'Cancel',
}) => {
  const defaultSubmitLabel = isSaving
    ? 'Saving...'
    : isCreateMode
    ? 'Create Lesson'
    : 'Save Changes';

  const resolvedSubmitLabel = submitLabel || defaultSubmitLabel;
  const isSubmitDisabled = isSaving || disabled;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
      className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:sticky md:bottom-0 left-0 right-0 z-30 border-t p-2.5 sm:p-3 shadow-lg w-full min-w-0 box-border"
    >
      <div className="max-w-[1100px] mx-auto grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:gap-3 w-full min-w-0">
        <button
          type="button"
          onClick={onCancel}
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
          className="w-full sm:w-auto h-[46px] sm:h-[44px] px-4 sm:px-6 text-xs sm:text-sm font-bold border rounded-[10px] sm:rounded-[12px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus:outline-none shrink-0"
        >
          {cancelLabel}
        </button>

        <button
          type="submit"
          form={formId}
          disabled={isSubmitDisabled}
          style={
            isSubmitDisabled && !isSaving
              ? {
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                  opacity: 0.6,
                }
              : {
                  backgroundColor: 'var(--brand-primary)',
                  borderColor: 'var(--brand-primary)',
                  color: 'var(--brand-primary-foreground, #FFFFFF)',
                }
          }
          className={`w-full sm:w-auto h-[46px] sm:h-[44px] px-4 sm:px-6 text-xs sm:text-sm font-bold border rounded-[10px] sm:rounded-[12px] flex items-center justify-center gap-1.5 transition-all focus:outline-none shrink-0 ${
            isSaving
              ? 'opacity-80 cursor-wait'
              : isSubmitDisabled
              ? 'cursor-not-allowed'
              : 'cursor-pointer hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          {resolvedSubmitLabel}
        </button>
      </div>
    </div>
  );
};

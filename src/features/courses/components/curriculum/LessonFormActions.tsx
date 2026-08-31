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
    ? 'Save Lesson'
    : 'Save Changes';

  const resolvedSubmitLabel = submitLabel || defaultSubmitLabel;
  const isSubmitDisabled = isSaving || disabled;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
      className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:sticky md:bottom-0 left-0 right-0 z-30 border-t p-3 sm:p-4 shadow-xl md:shadow-lg md:rounded-b-2xl w-full max-w-full min-w-0 box-border"
    >
      <div className="max-w-4xl mx-auto flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-4 w-full min-w-0">
        <button
          type="button"
          onClick={onCancel}
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
          className="w-full sm:w-auto h-11 sm:h-[42px] px-4 sm:px-6 text-sm font-medium border rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] min-h-[44px] sm:min-h-[42px] shrink-0"
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
          className={`w-full sm:w-auto h-11 sm:h-[42px] px-[18px] text-sm font-medium border rounded-lg flex items-center justify-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 min-h-[44px] sm:min-h-[42px] shrink-0 ${
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

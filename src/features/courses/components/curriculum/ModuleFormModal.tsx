import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertTriangle, Check } from 'lucide-react';
import type { CourseModule } from '../../../../types/curriculum.types';

// Zod Schema matching requirements
const moduleFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Section title is required' })
    .max(120, { message: 'Section title cannot exceed 120 characters' }),
  description: z
    .string()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .optional()
    .default(''),
  status: z.enum(['published', 'draft']).default('published'),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitModule: (data: Omit<CourseModule, 'uuid' | 'courseUuid' | 'sortOrder' | 'createdAt' | 'updatedAt' | 'lessonUuids'>) => Promise<void> | void;
  initialModule?: CourseModule | null;
}

export const ModuleFormModal: React.FC<ModuleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitModule,
  initialModule,
}) => {
  const isEditing = Boolean(initialModule);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: initialModule?.title || '',
      description: initialModule?.description || '',
      status: initialModule?.status === 'draft' ? 'draft' : 'published',
    },
  });

  const selectedStatus = watch('status');

  // Reset form when modal state or initialModule changes
  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setIsSubmitting(false);
      reset({
        title: initialModule?.title || '',
        description: initialModule?.description || '',
        status: initialModule?.status === 'draft' ? 'draft' : 'published',
      });
    }
  }, [isOpen, initialModule, reset]);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: ModuleFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmitModule({
        title: data.title.trim(),
        description: data.description?.trim() || '',
        status: data.status,
        durationMinutes: initialModule?.durationMinutes || 0,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err?.message || err?.response?.data?.message || 'Failed to save section. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 font-sans text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="module-form-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-[540px] bg-[var(--surface)] border border-[var(--border)] rounded-[16px] sm:rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-32px)] my-auto box-border">
        
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 flex items-start justify-between gap-3 shrink-0 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="min-w-0 flex-1">
            <h2 id="module-form-modal-title" className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {isEditing ? 'Edit Section' : 'Create Section'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-normal leading-normal">
              Add a new section to organize your lessons
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
          <div className="p-4 sm:p-6 space-y-4 flex-1">
            
            {/* Display error banner if submission fails */}
            {submitError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-500 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Section Title */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                Section Title *
              </label>
              <input
                {...register('title')}
                placeholder="e.g. Getting Started"
                autoFocus
                disabled={isSubmitting}
                className={`w-full h-10 sm:h-11 px-3.5 bg-[var(--surface-secondary)] border text-xs sm:text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-xl focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all ${
                  errors.title ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[var(--border)]'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.title.message}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                disabled={isSubmitting}
                placeholder="Add a short description..."
                className="w-full p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl text-xs sm:text-sm font-normal text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] resize-none transition-all"
              />
              {errors.description && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.description.message}</span>
                </p>
              )}
            </div>

            {/* Status Radio Tiles */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                Status
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Published Tile */}
                <button
                  type="button"
                  onClick={() => setValue('status', 'published', { shouldDirty: true })}
                  disabled={isSubmitting}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    selectedStatus === 'published'
                      ? 'bg-[var(--surface-secondary)] border-[var(--brand-primary)] ring-1.5 ring-[var(--brand-primary)]/40'
                      : 'bg-[var(--surface-secondary)] border-[var(--border)] hover:border-[var(--input-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Published</span>
                    {selectedStatus === 'published' && (
                      <div className="w-4 h-4 rounded-full bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--text-secondary)] mt-1 font-normal">Visible to students</span>
                </button>

                {/* Draft Tile */}
                <button
                  type="button"
                  onClick={() => setValue('status', 'draft', { shouldDirty: true })}
                  disabled={isSubmitting}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    selectedStatus === 'draft'
                      ? 'bg-[var(--surface-secondary)] border-[var(--brand-primary)] ring-1.5 ring-[var(--brand-primary)]/40'
                      : 'bg-[var(--surface-secondary)] border-[var(--border)] hover:border-[var(--input-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Draft</span>
                    {selectedStatus === 'draft' && (
                      <div className="w-4 h-4 rounded-full bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--text-secondary)] mt-1 font-normal">Only visible to you</span>
                </button>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-4 sm:px-6 py-3.5 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-end gap-2.5 shrink-0 pb-[calc(14px+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl bg-[var(--brand-primary)] hover:opacity-90 text-[var(--brand-primary-foreground)] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Section'
                : 'Create Section'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

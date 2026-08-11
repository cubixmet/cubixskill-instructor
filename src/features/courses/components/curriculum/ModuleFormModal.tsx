import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, AlertTriangle, Check, ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import type { CourseModule } from '../../../../types/curriculum.types';

// Simplified Zod Schema
const moduleFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Module title must be at least 3 characters' })
    .max(120, { message: 'Module title cannot exceed 120 characters' }),
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
  onSubmitModule: (data: Omit<CourseModule, 'uuid' | 'courseUuid' | 'sortOrder' | 'createdAt' | 'updatedAt' | 'lessonUuids'>) => void;
  initialModule?: CourseModule | null;
}

export const ModuleFormModal: React.FC<ModuleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitModule,
  initialModule,
}) => {
  const isEditing = Boolean(initialModule);
  const [isSubmittingLoading, setIsSubmittingLoading] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: initialModule?.title || '',
      description: initialModule?.description || '',
      status: initialModule?.status === 'draft' ? 'draft' : 'published',
    },
  });

  // Sync form state when modal opens or initialModule changes
  useEffect(() => {
    if (isOpen) {
      reset({
        title: initialModule?.title || '',
        description: initialModule?.description || '',
        status: initialModule?.status === 'draft' ? 'draft' : 'published',
      });
    }
  }, [isOpen, initialModule, reset]);

  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    setShowUnsavedWarning(false);
  }

  const handleRequestClose = useCallback(() => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleRequestClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleRequestClose]);

  const onFormSubmit = (data: ModuleFormValues) => {
    setIsSubmittingLoading(true);
    setTimeout(() => {
      onSubmitModule({
        title: data.title.trim(),
        description: data.description?.trim() || '',
        status: data.status,
        durationMinutes: initialModule?.durationMinutes || 0,
      });
      setIsSubmittingLoading(false);
      onClose();
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto no-scrollbar font-sans text-left">
          {/* Backdrop (hidden on mobile full-screen) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleRequestClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs hidden sm:block"
          />

          {/* Dialog Container */}
          <div className="min-h-full sm:p-4 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full h-full sm:h-auto max-w-lg bg-white sm:rounded-[20px] shadow-2xl overflow-hidden flex flex-col border border-[#E2E8F0] fixed sm:relative inset-0 sm:inset-auto z-50"
            >
              {/* Header */}
              <div className="px-4 sm:px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleRequestClose}
                    className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg sm:hidden cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100 shrink-0">
                    <Layers className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">
                      {isEditing ? 'Edit Module' : 'Add Module'}
                    </h3>
                    <p className="text-[11px] text-[#64748B] font-medium">
                      {isEditing
                        ? 'Update module title and optional description'
                        : 'New modules are published by default'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer hidden sm:block"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content Body */}
              <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar">
                <div className="p-4 sm:p-6 space-y-5 flex-1">
                  {/* Module Title */}
                  <div className="space-y-1.5" data-field-name="title">
                    <label className="block text-xs font-semibold text-[#0F172A]">
                      Module Title *
                    </label>
                    <Input
                      {...register('title')}
                      placeholder="e.g. Introduction to React 19"
                      aria-invalid={Boolean(errors.title)}
                      className={`w-full h-10 text-xs sm:text-sm font-medium ${
                        errors.title ? 'border-rose-500 ring-1 ring-rose-500/20 bg-rose-50/10' : ''
                      }`}
                      autoFocus
                    />
                    {errors.title && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{errors.title.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Module Description */}
                  <div className="space-y-1.5" data-field-name="description">
                    <label className="block text-xs font-semibold text-[#0F172A]">
                      Description <span className="text-[#64748B] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      placeholder="Brief overview of what students will learn in this module..."
                      className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB] resize-none"
                    />
                    {errors.description && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{errors.description.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Note */}
                  <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-[#2563EB] font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0 text-[#2563EB]" />
                    <span>Module duration is derived automatically from its lesson contents.</span>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="px-4 sm:px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-3 shrink-0 pb-[calc(14px+env(safe-area-inset-bottom))]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRequestClose}
                    className="border-[#E2E8F0] text-xs font-semibold h-10 px-4 cursor-pointer"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingLoading}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-10 px-5 cursor-pointer shadow-2xs"
                  >
                    {isSubmittingLoading
                      ? 'Saving...'
                      : isEditing
                      ? 'Update Module'
                      : 'Create Module'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Unsaved Changes Confirmation Modal */}
          {showUnsavedWarning && (
            <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-[#E2E8F0] text-left">
                <div className="flex items-center gap-2.5 text-amber-600 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Unsaved Changes</span>
                </div>
                <p className="text-xs text-[#64748B]">
                  You have unsaved changes. Are you sure you want to discard them?
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUnsavedWarning(false)}
                    className="text-xs font-semibold h-9 px-3"
                  >
                    Keep Editing
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setShowUnsavedWarning(false);
                      onClose();
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-9 px-3"
                  >
                    Discard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Layers,
  Clock,
  Lock,
  Check,
  AlertTriangle,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import type { CourseModule } from '../../store/curriculum.store';

// Zod Schema
const moduleFormSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: 'Module title must be at least 3 characters' })
      .max(120, { message: 'Title cannot exceed 120 characters' }),
    description: z
      .string()
      .max(500, { message: 'Description cannot exceed 500 characters' })
      .optional()
      .default(''),
    status: z.enum(['draft', 'published', 'scheduled']),
    scheduledAt: z.string().optional(),
    accessType: z.enum(['standard', 'demo']),
    unlockRule: z.enum([
      'immediate',
      'previous_module',
      'specific_date',
      'days_after_enrollment',
      'manual',
    ]),
    unlockDate: z.string().optional(),
    unlockAfterDays: z.coerce.number().optional(),
    durationHours: z.coerce.number().min(0).max(99).default(0),
    durationMinutes: z.coerce.number().min(0).max(59).default(0),
  })
  .refine(
    (data) => {
      if (data.status === 'scheduled' && !data.scheduledAt) {
        return false;
      }
      return true;
    },
    { message: 'Scheduled date is required when status is scheduled', path: ['scheduledAt'] }
  )
  .refine(
    (data) => {
      if (data.unlockRule === 'specific_date' && !data.unlockDate) {
        return false;
      }
      return true;
    },
    { message: 'Unlock date is required when unlock rule is set to specific date', path: ['unlockDate'] }
  );

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

  // Calculate default hours and mins
  const totalMins = initialModule?.durationMinutes || 0;
  const initialHours = Math.floor(totalMins / 60);
  const initialMinutes = totalMins % 60;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: initialModule?.title || '',
      description: initialModule?.description || '',
      status: initialModule?.status || 'draft',
      scheduledAt: initialModule?.scheduledAt || '',
      accessType: initialModule?.accessType || 'standard',
      unlockRule: initialModule?.unlockRule || 'immediate',
      unlockDate: initialModule?.unlockDate || '',
      unlockAfterDays: initialModule?.unlockAfterDays || 1,
      durationHours: initialHours,
      durationMinutes: initialMinutes,
    },
  });

  const descriptionValue = watch('description') || '';
  const statusValue = watch('status');
  const unlockRuleValue = watch('unlockRule');

  // Reset form when initialModule changes
  useEffect(() => {
    if (isOpen) {
      const mins = initialModule?.durationMinutes || 0;
      reset({
        title: initialModule?.title || '',
        description: initialModule?.description || '',
        status: initialModule?.status || 'draft',
        scheduledAt: initialModule?.scheduledAt || '',
        accessType: initialModule?.accessType || 'standard',
        unlockRule: initialModule?.unlockRule || 'immediate',
        unlockDate: initialModule?.unlockDate || '',
        unlockAfterDays: initialModule?.unlockAfterDays || 1,
        durationHours: Math.floor(mins / 60),
        durationMinutes: mins % 60,
      });
      setShowUnsavedWarning(false);
    }
  }, [isOpen, initialModule, reset]);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleRequestClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty]);

  // Prevent background body scrolling when modal is open
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

  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowUnsavedWarning(false);
    onClose();
  };

  const onFormSubmit = (data: ModuleFormValues) => {
    setIsSubmittingLoading(true);
    const calculatedDuration = (data.durationHours || 0) * 60 + (data.durationMinutes || 0);

    setTimeout(() => {
      onSubmitModule({
        title: data.title,
        description: data.description || '',
        status: data.status,
        scheduledAt: data.status === 'scheduled' ? data.scheduledAt : undefined,
        accessType: data.accessType,
        unlockRule: data.unlockRule,
        unlockDate: data.unlockRule === 'specific_date' ? data.unlockDate : undefined,
        unlockAfterDays: data.unlockRule === 'days_after_enrollment' ? data.unlockAfterDays : undefined,
        durationMinutes: calculatedDuration,
      });

      setIsSubmittingLoading(false);
      reset();
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
        {/* Overlay Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleRequestClose}
          className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
          className="relative z-10 w-full sm:max-w-xl max-h-[92vh] bg-white rounded-[20px] shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden text-left text-xs"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#E2E8F0] flex items-center justify-between shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold shrink-0 border border-blue-100">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A] text-base">
                  {isEditing ? 'Edit Module Settings' : 'Create New Course Module'}
                </h3>
                <p className="text-[12px] text-[#64748B] font-medium">
                  {isEditing ? 'Update module settings and access rules.' : 'Structure curriculum content into organized learning chapters.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestClose}
              className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
            {/* 1. MODULE TITLE */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-semibold text-[#0F172A]">
                Module Title <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register('title')}
                autoFocus
                placeholder="Enter module title (e.g. Module 1: Server Components)"
                className={`w-full font-semibold text-xs h-10 bg-white border-[#E2E8F0] rounded-xl focus:border-[#2563EB] ${
                  errors.title ? 'border-rose-500 focus:border-rose-500' : ''
                }`}
              />
              {errors.title && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* 2. MODULE DESCRIPTION WITH CHARACTER COUNTER */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[12px] font-semibold text-[#0F172A]">
                  Module Description <span className="text-[#64748B] font-normal">(Optional)</span>
                </label>
                <span
                  className={`text-[11px] font-medium ${
                    descriptionValue.length > 450 ? 'text-amber-600' : 'text-[#64748B]'
                  }`}
                >
                  {descriptionValue.length} / 500
                </span>
              </div>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Brief description outlining learning objectives of this module..."
                className={`w-full p-3 bg-white border rounded-xl font-normal text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB] resize-none ${
                  errors.description ? 'border-rose-500' : 'border-[#E2E8F0]'
                }`}
              />
              {errors.description && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* 3. MODULE STATUS & ACCESS TYPE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0F172A]">Module Status</label>
                <select
                  {...register('status')}
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg font-semibold text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="draft">Draft (Hidden from students)</option>
                  <option value="published">Published (Visible immediately)</option>
                  <option value="scheduled">Scheduled (Publish on date)</option>
                </select>
              </div>

              {statusValue === 'scheduled' && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#0F172A]">Scheduled Date</label>
                  <Input
                    type="datetime-local"
                    {...register('scheduledAt')}
                    className={`w-full h-9 font-semibold text-[#2563EB] bg-white border-[#E2E8F0] ${
                      errors.scheduledAt ? 'border-rose-500' : ''
                    }`}
                  />
                  {errors.scheduledAt && (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.scheduledAt.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0F172A]">Access Type</label>
                <select
                  {...register('accessType')}
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg font-semibold text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="standard">Standard Enrolled Module</option>
                  <option value="demo">Free Demo (Public Preview)</option>
                </select>
              </div>
            </div>

            {/* 4. MODULE UNLOCK RULES */}
            <div className="space-y-3 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <h4 className="font-semibold text-[#0F172A] text-xs flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#2563EB]" />
                Module Locking & Prerequisite Rule
              </h4>

              <div className="space-y-1">
                <select
                  {...register('unlockRule')}
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg font-semibold text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="immediate">Unlock Immediately</option>
                  <option value="previous_module">Unlock After Previous Module Completion</option>
                  <option value="specific_date">Unlock On Specific Date</option>
                  <option value="days_after_enrollment">Unlock X Days After Enrollment</option>
                  <option value="manual">Unlock Manually by Instructor</option>
                </select>
              </div>

              {unlockRuleValue === 'specific_date' && (
                <div className="space-y-1 pt-1">
                  <label className="block text-[11px] font-semibold text-[#0F172A]">Unlock Date</label>
                  <Input
                    type="date"
                    {...register('unlockDate')}
                    className={`w-full h-9 font-semibold text-[#2563EB] bg-white border-[#E2E8F0] ${
                      errors.unlockDate ? 'border-rose-500' : ''
                    }`}
                  />
                  {errors.unlockDate && (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.unlockDate.message}</p>
                  )}
                </div>
              )}

              {unlockRuleValue === 'days_after_enrollment' && (
                <div className="space-y-1 pt-1">
                  <label className="block text-[11px] font-semibold text-[#0F172A]">Days After Enrollment</label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    {...register('unlockAfterDays')}
                    className="w-full h-9 font-semibold text-[#2563EB] bg-white border-[#E2E8F0]"
                  />
                </div>
              )}
            </div>

            {/* 5. ESTIMATED DURATION */}
            <div className="space-y-2 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <label className="block text-[11px] font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2563EB]" />
                Estimated Module Duration <span className="text-[#64748B] font-normal">(Optional)</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-[#64748B]">Hours</span>
                  <Input
                    type="number"
                    min={0}
                    max={99}
                    {...register('durationHours')}
                    className="w-full h-9 font-semibold text-[#0F172A] bg-white border-[#E2E8F0]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-[#64748B]">Minutes</span>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    {...register('durationMinutes')}
                    className="w-full h-9 font-semibold text-[#0F172A] bg-white border-[#E2E8F0]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0] shrink-0 sticky bottom-0 bg-white min-h-[44px]">
              <Button type="button" variant="outline" onClick={handleRequestClose} className="h-10 px-4 text-[#0F172A] border-[#E2E8F0] bg-white text-xs font-semibold">
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmittingLoading}
                loadingText="Processing..."
                leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold h-10 px-5 rounded-xl shadow-xs text-xs cursor-pointer"
              >
                {isEditing ? 'Save Changes' : 'Create Module'}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Unsaved Changes Confirmation Modal */}
        {showUnsavedWarning && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xl space-y-4 text-left">
              <div className="flex items-center gap-3 text-amber-600 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                <span>Discard Unsaved Changes?</span>
              </div>
              <p className="text-[12px] text-[#64748B]">
                You have unsaved edits in this module configuration form. Are you sure you want to discard them?
              </p>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <Button variant="outline" size="sm" onClick={() => setShowUnsavedWarning(false)}>
                  Keep Editing
                </Button>
                <Button size="sm" onClick={handleConfirmDiscard} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                  Discard Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { curriculumService } from '../services/curriculum.service';
import { normalizeCourseId } from '../../../utils/courseValidation.utils';

const moduleFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Module title must be at least 3 characters' })
    .max(120, { message: 'Module title cannot exceed 120 characters' }),
  description: z
    .string()
    .max(300, { message: 'Description cannot exceed 300 characters' })
    .optional()
    .default(''),
  status: z.enum(['published', 'draft']).default('published'),
});

type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export const ModuleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ courseId?: string; courseUuid?: string }>();
  const rawCourseId = params.courseId || params.courseUuid;
  const validCourseUuid = normalizeCourseId(rawCourseId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'published',
    },
  });

  const descriptionValue = watch('description') || '';
  const currentStatus = watch('status');

  if (!validCourseUuid) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] space-y-4 max-w-lg mx-auto mt-12 shadow-xl font-sans">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Invalid Course URL</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">The course identifier in this URL is invalid or missing.</p>
        </div>
        <Link to="/courses">
          <Button variant="outline" size="sm" className="cursor-pointer">
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ModuleFormValues) => {
    if (isSubmitting || !validCourseUuid) return;
    try {
      setIsSubmitting(true);
      setServerError(null);
      await curriculumService.createModule(validCourseUuid, {
        title: data.title,
        description: data.description || '',
        status: data.status,
      });
      navigate(`/courses/${validCourseUuid}/curriculum`);
    } catch (err: any) {
      console.error('Failed to create module:', err);
      const parsedMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to create module. Please try again.';
      setServerError(parsedMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate(`/courses/${validCourseUuid}/curriculum`);
  };

  return (
    <div className="min-h-[100dvh] p-3 sm:p-5 bg-[var(--background)] flex items-center justify-center font-sans text-left box-border overflow-y-auto no-scrollbar">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40" onClick={handleClose} />

      {/* Main Modal Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-section-title"
        className="relative z-50 w-full max-w-[500px] bg-[var(--surface)] border border-[var(--border)] rounded-[20px] shadow-2xl overflow-hidden flex flex-col my-auto box-border"
      >
        {/* Compact Header */}
        <div className="px-4 sm:px-5 pt-4 pb-3 flex items-start justify-between gap-3 shrink-0 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="min-w-0 flex-1">
            <h2 id="create-section-title" className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Create Section
            </h2>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5 font-normal">
              Add a new section to organize your lessons
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Natural Form Body without Inner Scrollbar */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 text-left box-border"
        >
          {serverError && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-semibold">
              {serverError}
            </div>
          )}

          {/* 1. Section Title Field */}
          <div className="space-y-1 w-full min-w-0">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Section Title <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('title')}
              autoFocus
              type="text"
              placeholder="e.g. Getting Started"
              className={`w-full h-10 sm:h-11 px-3 bg-[var(--surface-secondary)] border ${
                errors.title ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[var(--input-border)]'
              } rounded-[12px] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all font-medium box-border`}
            />
            {errors.title && (
              <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.title.message}</p>
            )}
          </div>

          {/* 2. Description Field */}
          <div className="space-y-1 w-full min-w-0">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Add a short description for this section (optional)"
              className={`w-full p-2.5 sm:p-3 bg-[var(--surface-secondary)] border ${
                errors.description ? 'border-rose-500' : 'border-[var(--input-border)]'
              } rounded-[12px] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all resize-none font-normal min-h-[90px] sm:min-h-[100px] box-border`}
            />
            <div className="flex items-center justify-end">
              <span className="text-[10px] font-medium text-[var(--text-muted)]">
                {descriptionValue.length}/300
              </span>
            </div>
            {errors.description && (
              <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.description.message}</p>
            )}
          </div>

          {/* 3. Status Selector Cards */}
          <div className="space-y-1.5 w-full min-w-0">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Status
            </label>

            <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2 w-full">
              {/* Published Card */}
              <div
                onClick={() => setValue('status', 'published')}
                className={`p-2.5 sm:p-3 rounded-[12px] border cursor-pointer transition-all flex items-start gap-2.5 min-w-0 ${
                  currentStatus === 'published'
                    ? 'bg-[var(--surface-secondary)] border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]'
                    : 'bg-[var(--surface-secondary)] border-[var(--border)] hover:border-[var(--input-border)]'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  currentStatus === 'published' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-[var(--text-muted)]'
                }`}>
                  {currentStatus === 'published' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Published</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-tight">Visible to students</p>
                </div>
              </div>

              {/* Draft Card */}
              <div
                onClick={() => setValue('status', 'draft')}
                className={`p-2.5 sm:p-3 rounded-[12px] border cursor-pointer transition-all flex items-start gap-2.5 min-w-0 ${
                  currentStatus === 'draft'
                    ? 'bg-[var(--surface-secondary)] border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]'
                    : 'bg-[var(--surface-secondary)] border-[var(--border)] hover:border-[var(--input-border)]'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  currentStatus === 'draft' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-[var(--text-muted)]'
                }`}>
                  {currentStatus === 'draft' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Draft</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-tight">Only visible to you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-2 pb-[calc(4px+env(safe-area-inset-bottom))] w-full">
            <button
              type="button"
              onClick={handleClose}
              className="h-10 sm:h-11 rounded-[12px] border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 sm:h-11 rounded-[12px] bg-[var(--brand-primary)] hover:opacity-90 active:scale-[0.98] text-[var(--brand-primary-foreground)] text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

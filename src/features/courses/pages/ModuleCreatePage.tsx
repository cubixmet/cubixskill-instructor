import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Layers, AlertTriangle } from 'lucide-react';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
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
    .max(500, { message: 'Description cannot exceed 500 characters' })
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
    formState: { errors },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'published',
    },
  });

  const titleValue = watch('title') || '';
  const descriptionValue = watch('description') || '';

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
      // Return directly to curriculum view
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

  return (
    <FormPageLayout
      title="Create Section"
      subtitle="Add a new section to organize your curriculum"
      backUrl={`/courses/${validCourseUuid}/curriculum`}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${validCourseUuid}/curriculum` },
        { label: 'Create Section' },
      ]}
    >
      <form
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          const firstErrorField = Object.keys(formErrors)[0];
          if (firstErrorField) {
            const el = document.getElementsByName(firstErrorField)[0];
            if (el) el.focus();
          }
        })}
        className="space-y-4 max-w-xl mx-auto font-sans pb-36 md:pb-8 w-full min-w-0 px-1 md:px-0 text-left"
      >
        {serverError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-700 dark:text-[#F87171] text-xs font-semibold">
            {serverError}
          </div>
        )}

        <div className="p-4 sm:p-5 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs space-y-4 w-full min-w-0">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0] dark:border-[#263244]">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Section Details</h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Quickly set up your new course section.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Field 1: Section Title */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">
                  Section Name <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
                </label>
                <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  {titleValue.length} / 120
                </span>
              </div>
              <Input
                {...register('title')}
                autoFocus
                placeholder="e.g. Getting Started"
                className="h-11 text-xs sm:text-sm font-medium rounded-xl"
                error={errors.title?.message}
              />
            </div>

            {/* Field 2: Description */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">
                  Description <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">(Optional)</span>
                </label>
                <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  {descriptionValue.length} / 500
                </span>
              </div>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Brief overview of what students will learn..."
                className={`w-full p-3 bg-white dark:bg-[#0F172A] border ${
                  errors.description
                    ? 'border-rose-500 dark:border-rose-400/70 ring-1 ring-rose-500/20'
                    : 'border-[#E2E8F0] dark:border-[#334155]'
                } rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#2563EB]/10 dark:focus:ring-[#3B82F6]/10 transition-all resize-y font-normal`}
              />
              {errors.description && (
                <p className="text-[11px] text-rose-600 dark:text-[#F87171] font-medium mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Field 3: Status */}
            <div>
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] mb-1">Publish Status</label>
              <select
                {...register('status')}
                className="w-full h-11 px-3 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#2563EB]/10 dark:focus:ring-[#3B82F6]/10 cursor-pointer"
              >
                <option value="published" className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">
                  Published (Visible to students)
                </option>
                <option value="draft" className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">
                  Draft (Hidden from students)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed md:relative bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 z-35 p-3 md:p-0 bg-white/95 dark:bg-[#111827]/95 md:bg-transparent dark:md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t md:border-0 border-[#E2E8F0] dark:border-[#263244] shadow-lg md:shadow-none flex items-center justify-between gap-3 md:pt-2 max-w-xl mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/courses/${validCourseUuid}/curriculum`)}
            className="h-11 md:h-10 text-xs font-semibold px-4 md:px-5 shrink-0 bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC] cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4 stroke-[3]" />}
            className="h-11 md:h-10 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-xs sm:text-sm font-medium px-5 md:px-6 shadow-[0_4px_12px_rgba(37,99,235,0.12)] flex-1 md:flex-initial cursor-pointer"
          >
            {isSubmitting ? 'Adding Section...' : 'Add Section'}
          </Button>
        </div>
      </form>
    </FormPageLayout>
  );
};

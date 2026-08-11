import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Layers } from 'lucide-react';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { curriculumService } from '../services/curriculum.service';

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
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();
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

  const onSubmit = (data: ModuleFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setServerError(null);
      curriculumService.createModule(courseUuid, {
        title: data.title,
        description: data.description || '',
        status: data.status,
      });
      // Return directly to curriculum view
      navigate(`/courses/${courseUuid}/curriculum`);
    } catch (err) {
      console.error('Failed to create module:', err);
      setServerError('Failed to create module. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormPageLayout
      title="Create Module"
      subtitle="Add a new section to organize your curriculum"
      backUrl={`/courses/${courseUuid}/curriculum`}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${courseUuid}/curriculum` },
        { label: 'Create Module' },
      ]}
    >
      <form
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          // Focus first invalid field on error
          const firstErrorField = Object.keys(formErrors)[0];
          if (firstErrorField) {
            const el = document.getElementsByName(firstErrorField)[0];
            if (el) el.focus();
          }
        })}
        className="space-y-4 max-w-xl mx-auto font-sans pb-36 md:pb-8 w-full min-w-0 px-1 md:px-0"
      >
        {serverError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {serverError}
          </div>
        )}

        <div className="p-4 sm:p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs space-y-4 w-full min-w-0">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Module Details</h3>
              <p className="text-[11px] text-[#64748B]">Quickly set up your new course section.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Field 1: Module Title */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Module Title <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-medium text-[#64748B]">
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
                <label className="block text-xs font-bold text-[#0F172A]">
                  Description <span className="text-[#64748B] font-normal">(Optional)</span>
                </label>
                <span className="text-[10px] font-medium text-[#64748B]">
                  {descriptionValue.length} / 500
                </span>
              </div>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Brief overview of what students will learn..."
                className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] transition-all resize-y font-normal"
              />
              {errors.description && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Field 3: Status */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Publish Status</label>
              <select
                {...register('status')}
                className="w-full h-11 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="published">Published (Visible to students)</option>
                <option value="draft">Draft (Hidden from students)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Action Bar (Above App Bottom Nav) / Desktop Action Bar */}
        <div className="fixed md:relative bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 z-35 p-3 md:p-0 bg-white/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t md:border-0 border-[#E2E8F0] shadow-lg md:shadow-none flex items-center justify-between gap-3 md:pt-2 max-w-xl mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/courses/${courseUuid}/curriculum`)}
            className="h-11 md:h-10 text-xs font-bold px-4 md:px-5 shrink-0"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4 stroke-[3]" />}
            className="h-11 md:h-10 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-xs sm:text-sm font-bold px-5 md:px-6 shadow-md flex-1 md:flex-initial"
          >
            {isSubmitting ? 'Creating Module...' : 'Create Module'}
          </Button>
        </div>
      </form>
    </FormPageLayout>
  );
};

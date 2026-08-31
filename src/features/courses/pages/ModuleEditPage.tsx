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
import { useCurriculumStore } from '../store/curriculum.store';

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

export const ModuleEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid = '', moduleUuid = '' } = useParams<{
    courseUuid?: string;
    moduleUuid?: string;
  }>();

  const existingModule = useCurriculumStore((state) =>
    state.modules.find((m) => m.uuid === moduleUuid)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: existingModule?.title || '',
      description: existingModule?.description || '',
      status: existingModule?.status === 'draft' ? 'draft' : 'published',
    },
  });

  const onSubmit = async (data: ModuleFormValues) => {
    if (isSubmitting || !moduleUuid || !courseUuid) return;
    try {
      setIsSubmitting(true);
      await curriculumService.updateModule(moduleUuid, courseUuid, {
        title: data.title,
        description: data.description || '',
        status: data.status,
      });
      navigate(`/courses/${courseUuid}/curriculum`);
    } catch (err) {
      console.error('Failed to update module:', err);
      alert('Failed to update module. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!existingModule) {
    return (
      <FormPageLayout
        title="Edit Section"
        backUrl={`/courses/${courseUuid}/curriculum`}
        breadcrumbs={[
          { label: 'Curriculum', url: `/courses/${courseUuid}/curriculum` },
          { label: 'Edit Section' },
        ]}
      >
        <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-3 font-sans">
          <h3 className="font-bold text-[#0F172A] text-sm">Section Not Found</h3>
          <p className="text-xs text-[#64748B]">Unable to locate the specified course section.</p>
          <Button onClick={() => navigate(`/courses/${courseUuid}/curriculum`)} className="bg-[#2563EB] text-white">
            Return to Curriculum
          </Button>
        </div>
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout
      title={`Edit Section: ${existingModule.title}`}
      subtitle="Update section title, description, and status."
      backUrl={`/courses/${courseUuid}/curriculum`}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${courseUuid}/curriculum` },
        { label: 'Edit Section' },
      ]}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto font-sans pb-12 text-left">
        <div className="p-5 sm:p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Section Details</h3>
              <p className="text-[11px] text-[#64748B]">Update section title and description.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Section Name <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register('title')}
                placeholder="e.g. Getting Started"
                className="h-10 text-xs sm:text-sm font-medium"
                error={errors.title?.message}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Description <span className="text-[#64748B] font-normal">(Optional)</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Overview of what students will master in this section..."
                className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] transition-all resize-y"
              />
              {errors.description && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="published">Published (Visible to students)</option>
                <option value="draft">Draft (Hidden from students)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/courses/${courseUuid}/curriculum`)}
            className="h-10 text-xs font-bold px-5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4 stroke-[3]" />}
            className="h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-6 shadow-sm"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </FormPageLayout>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { SingleLessonEditor } from '../components/curriculum/SingleLessonEditor';
import { curriculumService } from '../services/curriculum.service';
import { useCurriculumStore } from '../store/curriculum.store';
import { getLessonTypeMeta } from '../config/lessonTypes.config';
import { Button } from '../../../components/ui/Button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import type { CourseLesson } from '../../../types/curriculum.types';
import { isValidCourseId } from '../../../utils/courseValidation.utils';

export const LessonEditPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams<{
    courseId?: string;
    courseUuid?: string;
    lessonId?: string;
    lessonUuid?: string;
  }>();

  const effectiveCourseId = (params.courseId || params.courseUuid || '').trim();
  const effectiveLessonId = (params.lessonId || params.lessonUuid || '').trim();
  const moduleUuidFromQuery = searchParams.get('moduleUuid') || '';

  const isCourseValid = isValidCourseId(effectiveCourseId);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const existingLesson = useCurriculumStore((state) =>
    state.lessons.find((l) => l.uuid === effectiveLessonId || l.id === effectiveLessonId)
  );

  const modules = useCurriculumStore((state) => state.modules);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isCourseValid || !effectiveCourseId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setFetchError(null);

      try {
        await curriculumService.fetchModules(effectiveCourseId);
      } catch (err: any) {
        console.error('[LessonEditPage] Error loading curriculum:', err);
        if (isMounted) {
          setFetchError(err?.response?.data?.message || err?.message || 'Failed to load course modules.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [effectiveCourseId, isCourseValid]);

  const parentModule = modules.find(
    (m) => m.uuid === existingLesson?.moduleUuid || m.uuid === moduleUuidFromQuery
  );

  const handleSaveLesson = async (data: Partial<CourseLesson>): Promise<void> => {
    if (!effectiveLessonId || !effectiveCourseId) return;

    try {
      if (data.moduleUuid && existingLesson && data.moduleUuid !== existingLesson.moduleUuid) {
        curriculumService.moveLesson(effectiveLessonId, data.moduleUuid);
      }
      await curriculumService.updateLesson(effectiveLessonId, data);
      navigate(`/courses/${effectiveCourseId}/curriculum`);
    } catch (err: any) {
      console.error('Failed to update lesson:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Unable to save lesson changes. Please try again.';
      alert(errMsg);
      throw err;
    }
  };

  if (!isCourseValid) {
    return (
      <FormPageLayout
        title="Edit Lesson"
        subtitle="Invalid Course Identifier"
        backUrl="/courses"
        breadcrumbs={[{ label: 'Courses', url: '/courses' }, { label: 'Invalid Course' }]}
      >
        <div className="w-full max-w-lg mx-auto py-12 px-4 text-center space-y-4 font-sans">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Invalid Course URL</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The course identifier in the URL is missing or invalid.
          </p>
          <Button onClick={() => navigate('/courses')} className="bg-[#2563EB] text-white">
            Back to Courses
          </Button>
        </div>
      </FormPageLayout>
    );
  }

  if (isLoading) {
    return (
      <FormPageLayout
        title="Edit Lesson"
        subtitle="Loading Lesson Data..."
        backUrl={`/courses/${effectiveCourseId}/curriculum`}
        breadcrumbs={[
          { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
          { label: 'Edit Lesson' },
        ]}
      >
        <div className="w-full max-w-md mx-auto py-16 text-center space-y-4 font-sans">
          <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Loading lesson details...
          </p>
        </div>
      </FormPageLayout>
    );
  }

  if (!existingLesson) {
    return (
      <FormPageLayout
        title="Edit Lesson"
        backUrl={`/courses/${effectiveCourseId}/curriculum`}
        breadcrumbs={[
          { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
          { label: 'Edit Lesson' },
        ]}
      >
        <div className="p-8 text-center bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl space-y-4 font-sans max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-base">Lesson Not Found</h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {fetchError || 'Unable to locate the specified lesson record.'}
          </p>
          <Button onClick={() => navigate(`/courses/${effectiveCourseId}/curriculum`)} className="bg-[#2563EB] text-white">
            Return to Curriculum
          </Button>
        </div>
      </FormPageLayout>
    );
  }

  const typeMeta = getLessonTypeMeta(existingLesson.type);
  const pageTitle = `Edit ${typeMeta.label}: ${existingLesson.title}`;
  const moduleTitle = parentModule?.title || 'Selected Module';

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={`Parent module: ${moduleTitle}`}
      backUrl={`/courses/${effectiveCourseId}/curriculum`}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
        { label: moduleTitle, url: `/courses/${effectiveCourseId}/curriculum` },
        { label: pageTitle },
      ]}
    >
      <SingleLessonEditor
        type={existingLesson.type}
        moduleTitle={moduleTitle}
        moduleUuid={existingLesson.moduleUuid || moduleUuidFromQuery}
        lesson={existingLesson}
        onSaveLesson={handleSaveLesson}
        onCancel={() => navigate(`/courses/${effectiveCourseId}/curriculum`)}
        isCreateMode={false}
      />
    </FormPageLayout>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { SingleLessonEditor } from '../components/curriculum/SingleLessonEditor';
import { curriculumService } from '../services/curriculum.service';
import { useCurriculumStore } from '../store/curriculum.store';
import { getLessonTypeMeta, normalizeLessonType } from '../config/lessonTypes.config';
import { Button } from '../../../components/ui/Button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import type { CourseLesson, LessonType } from '../../../types/curriculum.types';
import { isValidCourseId, isValidModuleUuid } from '../../../utils/courseValidation.utils';

export const LessonCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams<{ courseId?: string; courseUuid?: string }>();
  const effectiveCourseId = (params.courseId || params.courseUuid || '').trim();

  const isCourseValid = isValidCourseId(effectiveCourseId);
  const targetModuleUuid = searchParams.get('moduleUuid') || '';
  const rawTypeParam = searchParams.get('type');

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Redirect if type parameter is missing or if type is QUIZ
  useEffect(() => {
    if (isCourseValid && !rawTypeParam) {
      const query = targetModuleUuid ? `?moduleUuid=${targetModuleUuid}` : '';
      navigate(`/courses/${effectiveCourseId}/curriculum/lessons/select-type${query}`, { replace: true });
    } else if (isCourseValid && rawTypeParam && rawTypeParam.toLowerCase() === 'quiz') {
      const query = targetModuleUuid ? `?moduleUuid=${targetModuleUuid}` : '';
      navigate(`/courses/${effectiveCourseId}/curriculum/quizzes/new${query}`, { replace: true });
    }
  }, [isCourseValid, rawTypeParam, effectiveCourseId, targetModuleUuid, navigate]);

  const lessonType: LessonType = normalizeLessonType(rawTypeParam || 'video');
  const typeMeta = getLessonTypeMeta(lessonType);

  const allModules = useCurriculumStore((state) => state.modules);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isCourseValid || !effectiveCourseId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        await curriculumService.fetchModules(effectiveCourseId);
      } catch (err) {
        console.error('[LessonCreatePage] Error fetching modules:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [effectiveCourseId, isCourseValid]);

  const selectedModule =
    allModules.find((m) => m.uuid === targetModuleUuid) ||
    allModules.find((m) => m.courseUuid === effectiveCourseId) ||
    allModules[0];

  const draftLesson: CourseLesson = {
    uuid: '',
    courseUuid: effectiveCourseId,
    moduleUuid: selectedModule?.uuid || targetModuleUuid || '',
    title: '',
    description: '',
    type: lessonType,
    status: 'published',
    sortOrder: 999,
    durationMinutes: 15,
    isDemo: false,
    content: { videoSource: 'upload', allowDownload: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const getPageTitle = () => {
    if (lessonType === 'quiz') return 'Create Quiz';
    if (lessonType === 'assignment') return 'Create Assignment';
    if (lessonType === 'project') return 'Create Project';
    return `Create ${typeMeta.label}`;
  };

  const handleSaveLesson = async (data: Partial<CourseLesson>): Promise<CourseLesson> => {
    const finalModuleUuid = data.moduleUuid || targetModuleUuid || selectedModule?.uuid || '';
    if (!finalModuleUuid || !isValidModuleUuid(finalModuleUuid)) {
      alert('Please select a valid target module before saving.');
      throw new Error('Invalid module UUID');
    }

    try {
      const created = await curriculumService.createLesson(
        effectiveCourseId,
        finalModuleUuid,
        {
          title: data.title || `Untitled ${typeMeta.label}`,
          description: data.description || '',
          type: lessonType,
          status: 'published',
          durationMinutes: data.durationMinutes || 15,
          isDemo: data.isDemo || false,
          allowDownload: data.allowDownload || false,
          content: data.content,
        }
      );
      navigate(`/courses/${effectiveCourseId}/curriculum`);
      setTimeout(() => {
        const el = document.getElementById(`lesson-${created.uuid}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return created;
    } catch (err: any) {
      console.error('Failed to create lesson:', err);
      const errMsg = err?.response?.data?.message || err?.message || `Unable to create ${typeMeta.label}. Please try again.`;
      alert(errMsg);
      throw err;
    }
  };

  if (!isCourseValid) {
    return (
      <FormPageLayout
        title="Add Lesson"
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
          <Button onClick={() => navigate('/courses')} className="bg-[#2563EB] text-white font-medium">
            Back to Courses
          </Button>
        </div>
      </FormPageLayout>
    );
  }

  if (isLoading) {
    return (
      <FormPageLayout
        title="Add Lesson"
        subtitle="Loading Curriculum Setup..."
        backUrl={`/courses/${effectiveCourseId}/curriculum`}
        breadcrumbs={[
          { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
          { label: 'Add Lesson' },
        ]}
      >
        <div className="w-full max-w-md mx-auto py-16 text-center space-y-4 font-sans">
          <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Loading lesson creation setup...
          </p>
        </div>
      </FormPageLayout>
    );
  }

  const moduleTitle = selectedModule?.title || 'Selected Section';
  const pageTitle = getPageTitle();

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={`Adding to section: ${moduleTitle}`}
      backUrl={`/courses/${effectiveCourseId}/curriculum/lessons/select-type${
        selectedModule?.uuid || targetModuleUuid ? `?moduleUuid=${selectedModule?.uuid || targetModuleUuid}` : ''
      }`}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
        { label: moduleTitle, url: `/courses/${effectiveCourseId}/curriculum` },
        { label: 'Add Lesson', url: `/courses/${effectiveCourseId}/curriculum/lessons/select-type?moduleUuid=${selectedModule?.uuid || targetModuleUuid}` },
        { label: pageTitle },
      ]}
    >
      <SingleLessonEditor
        type={lessonType}
        moduleTitle={moduleTitle}
        moduleUuid={selectedModule?.uuid || targetModuleUuid}
        lesson={draftLesson}
        onSaveLesson={handleSaveLesson}
        onCancel={() => navigate(`/courses/${effectiveCourseId}/curriculum`)}
        isCreateMode={true}
      />
    </FormPageLayout>
  );
};

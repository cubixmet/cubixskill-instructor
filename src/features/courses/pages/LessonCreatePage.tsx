import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { SingleLessonEditor } from '../components/curriculum/SingleLessonEditor';
import { curriculumService } from '../services/curriculum.service';
import { useCurriculumStore } from '../store/curriculum.store';
import { getLessonTypeMeta, normalizeLessonType } from '../config/lessonTypes.config';
import type { CourseLesson, LessonType } from '../../../types/curriculum.types';

export const LessonCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courseUuid = '' } = useParams<{ courseUuid?: string }>();

  const targetModuleUuid = searchParams.get('moduleUuid') || '';
  const rawTypeParam = searchParams.get('type') || 'video';
  const lessonType: LessonType = normalizeLessonType(rawTypeParam);
  const typeMeta = getLessonTypeMeta(lessonType);

  const allModules = useCurriculumStore((state) => state.modules);
  const selectedModule =
    allModules.find((m) => m.uuid === targetModuleUuid) ||
    allModules.find((m) => m.courseUuid === courseUuid) ||
    allModules[0];

  const [draftLesson] = useState<CourseLesson>({
    uuid: '',
    courseUuid,
    moduleUuid: selectedModule?.uuid || '',
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
  });

  const getPageTitle = () => {
    if (lessonType === 'quiz') return 'Create Quiz';
    if (lessonType === 'assignment') return 'Create Assignment';
    if (lessonType === 'project') return 'Create Project';
    return `Create ${typeMeta.label}`;
  };

  const handleSaveLesson = async (data: Partial<CourseLesson>) => {
    try {
      const finalModuleUuid = data.moduleUuid || targetModuleUuid || selectedModule?.uuid || '';
      const created = await curriculumService.createLesson(
        courseUuid,
        finalModuleUuid,
        {
          title: data.title || `Untitled ${typeMeta.label}`,
          description: data.description || '',
          type: lessonType,
          status: 'published',
          durationMinutes: data.durationMinutes || 15,
          isDemo: data.isDemo || false,
          content: data.content,
        }
      );
      navigate(`/courses/${courseUuid}/curriculum`);
      setTimeout(() => {
        const el = document.getElementById(`lesson-${created.uuid}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    } catch (err) {
      console.error('Failed to create lesson:', err);
      alert(`Unable to create ${typeMeta.label}. Please try again.`);
    }
  };

  const moduleTitle = selectedModule?.title || 'Selected Module';
  const pageTitle = getPageTitle();

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={`Adding to module: ${moduleTitle}`}
      backUrl={`/courses/${courseUuid}/curriculum/lessons/select-type${
        selectedModule?.uuid ? `?moduleUuid=${selectedModule.uuid}` : ''
      }`}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${courseUuid}/curriculum` },
        { label: moduleTitle, url: `/courses/${courseUuid}/curriculum` },
        { label: 'Add Lesson', url: `/courses/${courseUuid}/curriculum/lessons/select-type?moduleUuid=${selectedModule?.uuid || ''}` },
        { label: pageTitle },
      ]}
    >
      <SingleLessonEditor
        type={lessonType}
        moduleTitle={moduleTitle}
        moduleUuid={selectedModule?.uuid || targetModuleUuid}
        lesson={draftLesson}
        onSaveLesson={handleSaveLesson}
        onCancel={() => navigate(`/courses/${courseUuid}/curriculum`)}
        isCreateMode={true}
      />
    </FormPageLayout>
  );
};

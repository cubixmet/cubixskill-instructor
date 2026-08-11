import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { VideoLessonSettings } from '../components/curriculum/VideoLessonSettings';
import { GenericLessonSettings } from '../components/curriculum/GenericLessonSettings';
import { curriculumService } from '../services/curriculum.service';
import { useCurriculumStore } from '../store/curriculum.store';
import { getLessonTypeMeta } from '../config/lessonTypes.config';
import { Button } from '../../../components/ui/Button';
import type { CourseLesson } from '../../../types/curriculum.types';

export const LessonEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000', lessonUuid = '' } = useParams<{
    courseUuid?: string;
    lessonUuid?: string;
  }>();

  const existingLesson = useCurriculumStore((state) =>
    state.lessons.find((l) => l.uuid === lessonUuid)
  );

  const modules = useCurriculumStore((state) => state.modules);
  const parentModule = modules.find((m) => m.uuid === existingLesson?.moduleUuid);

  const handleSaveLesson = (data: Partial<CourseLesson>) => {
    if (!lessonUuid) return;
    try {
      curriculumService.updateLesson(lessonUuid, data);
      navigate(`/courses/${courseUuid}/curriculum`);
    } catch (err) {
      console.error('Failed to update lesson:', err);
      alert('Unable to save lesson changes. Please try again.');
    }
  };

  if (!existingLesson) {
    return (
      <FormPageLayout
        title="Edit Lesson"
        backUrl={`/courses/${courseUuid}/curriculum`}
        breadcrumbs={[
          { label: 'Curriculum', url: `/courses/${courseUuid}/curriculum` },
          { label: 'Edit Lesson' },
        ]}
      >
        <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-3 font-sans">
          <h3 className="font-bold text-[#0F172A] text-sm">Lesson Not Found</h3>
          <p className="text-xs text-[#64748B]">Unable to locate the specified lesson.</p>
          <Button onClick={() => navigate(`/courses/${courseUuid}/curriculum`)} className="bg-[#2563EB] text-white">
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
      backUrl={`/courses/${courseUuid}/curriculum`}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${courseUuid}/curriculum` },
        { label: moduleTitle, url: `/courses/${courseUuid}/curriculum` },
        { label: pageTitle },
      ]}
    >
      {existingLesson.type === 'video' ? (
        <VideoLessonSettings
          lesson={existingLesson}
          moduleTitle={moduleTitle}
          onSaveLesson={handleSaveLesson}
          isCreateMode={false}
        />
      ) : (
        <GenericLessonSettings
          type={existingLesson.type}
          moduleTitle={moduleTitle}
          lesson={existingLesson}
          onSaveLesson={handleSaveLesson}
          isCreateMode={false}
        />
      )}
    </FormPageLayout>
  );
};

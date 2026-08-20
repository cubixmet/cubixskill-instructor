import React from 'react';
import type { CourseLesson, LessonType } from '../../../../types/curriculum.types';
import { SingleLessonEditor } from './SingleLessonEditor';

interface GenericLessonSettingsProps {
  type: LessonType;
  moduleTitle?: string;
  onSaveLesson: (updated: Partial<CourseLesson>) => void;
  onCancel?: () => void;
  lesson?: CourseLesson;
  isCreateMode?: boolean;
}

export const GenericLessonSettings: React.FC<GenericLessonSettingsProps> = ({
  type,
  moduleTitle,
  onSaveLesson,
  onCancel,
  lesson,
  isCreateMode = true,
}) => {
  return (
    <SingleLessonEditor
      type={type}
      moduleTitle={moduleTitle}
      onSaveLesson={onSaveLesson}
      onCancel={onCancel}
      lesson={lesson}
      isCreateMode={isCreateMode}
    />
  );
};

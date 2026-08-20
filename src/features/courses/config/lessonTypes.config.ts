import React from 'react';
import {
  Video,
  Headphones,
  Files,
  AlignLeft,
  Image as ImageIcon,
  CircleHelp,
  ClipboardCheck,
  Award,
} from 'lucide-react';
import type { LessonType } from '../../../types/curriculum.types';

export interface LessonTypeMeta {
  id: LessonType;
  label: string;
  description: string;
  icon: React.ElementType;
  category: 'Lessons' | 'Assessments';
  requiredFeature?: string;
}

export const LESSON_TYPES_CONFIG: LessonTypeMeta[] = [
  // LESSONS
  {
    id: 'video',
    label: 'Video Lesson',
    description: 'Upload or embed video content',
    icon: Video,
    category: 'Lessons',
  },
  {
    id: 'audio',
    label: 'Audio Lesson',
    description: 'Add audio learning content',
    icon: Headphones,
    category: 'Lessons',
  },
  {
    id: 'document',
    label: 'Document Lesson',
    description: 'Create document-based learning content',
    icon: Files,
    category: 'Lessons',
  },
  {
    id: 'image',
    label: 'Image Lesson',
    description: 'Create image-based learning content',
    icon: ImageIcon,
    category: 'Lessons',
  },
  {
    id: 'text',
    label: 'Text Lesson',
    description: 'Create rich text learning content',
    icon: AlignLeft,
    category: 'Lessons',
  },

  // ASSESSMENTS
  {
    id: 'quiz',
    label: 'Quiz',
    description: 'Create questions and assessment',
    icon: CircleHelp,
    category: 'Assessments',
    requiredFeature: 'quizzes',
  },
  {
    id: 'assignment',
    label: 'Assignment',
    description: 'Create an assignment for learners',
    icon: ClipboardCheck,
    category: 'Assessments',
    requiredFeature: 'assignments',
  },
  {
    id: 'project',
    label: 'Project',
    description: 'Create a hands-on project for learners',
    icon: Award,
    category: 'Assessments',
    requiredFeature: 'assignments',
  },
];

export const normalizeLessonType = (rawType: string): LessonType => {
  const t = (rawType || '').toLowerCase().trim();
  if (t === 'video' || t === 'embed' || t === 'external_url') return 'video';
  if (t === 'audio') return 'audio';
  if (t === 'pdf' || t === 'document' || t === 'doc' || t === 'rich-document' || t === 'download') return 'document';
  if (t === 'text') return 'text';
  if (t === 'image') return 'image';
  if (t === 'quiz') return 'quiz';
  if (t === 'assignment' || t === 'manual-assignment') return 'assignment';
  if (t === 'project') return 'project';
  return 'video'; // Safe default
};

export const getLessonTypeMeta = (type: string): LessonTypeMeta => {
  const normalized = normalizeLessonType(type);
  return (
    LESSON_TYPES_CONFIG.find((c) => c.id === normalized) || LESSON_TYPES_CONFIG[0]
  );
};

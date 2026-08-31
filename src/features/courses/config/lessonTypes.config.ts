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
  if (t === 'video' || t === 'embed') return 'video';
  if (t === 'audio') return 'audio';
  if (t === 'pdf' || t === 'document' || t === 'doc' || t === 'rich-document' || t === 'download') return 'document';
  if (t === 'text' || t === 'rich_text' || t === 'article') return 'text';
  if (t === 'image') return 'image';
  if (t === 'quiz') return 'quiz';
  if (t === 'assignment' || t === 'manual-assignment') return 'assignment';
  if (t === 'project') return 'project';
  if (t === 'url' || t === 'external_url') return 'video';
  return 'video'; // Safe fallback
};

export const toBackendLessonType = (type: string): string => {
  const normalized = normalizeLessonType(type);
  switch (normalized) {
    case 'video':
      return 'VIDEO';
    case 'audio':
      return 'AUDIO';
    case 'document':
      return 'DOCUMENT';
    case 'image':
      return 'IMAGE';
    case 'text':
      return 'RICH_TEXT';
    case 'quiz':
      return 'QUIZ';
    case 'assignment':
      return 'ASSIGNMENT';
    case 'project':
      return 'PROJECT';
    default:
      return 'VIDEO';
  }
};

export const fromBackendLessonType = (backendType: string): LessonType => {
  const t = (backendType || '').toUpperCase().trim();
  switch (t) {
    case 'VIDEO':
    case 'URL':
      return 'video';
    case 'AUDIO':
      return 'audio';
    case 'DOCUMENT':
      return 'document';
    case 'IMAGE':
      return 'image';
    case 'RICH_TEXT':
    case 'TEXT':
      return 'text';
    case 'QUIZ':
      return 'quiz';
    case 'ASSIGNMENT':
      return 'assignment';
    case 'PROJECT':
      return 'project';
    default:
      return 'video';
  }
};

export const getLessonTypeMeta = (type: string): LessonTypeMeta => {
  const normalized = normalizeLessonType(type);
  return (
    LESSON_TYPES_CONFIG.find((c) => c.id === normalized) || LESSON_TYPES_CONFIG[0]
  );
};


export type ContentStatus =
  | 'draft'
  | 'published'
  | 'scheduled'
  | 'archived';

export type LessonType =
  | 'video'
  | 'audio'
  | 'pdf'
  | 'document'
  | 'text'
  | 'image'
  | 'download'
  | 'external_url'
  | 'embed'
  | 'quiz'
  | 'assignment'
  | 'live_class';

export type UnlockRule =
  | 'immediate'
  | 'previous_lesson'
  | 'previous_module'
  | 'video_completion'
  | 'quiz_pass'
  | 'assignment_approval'
  | 'specific_date'
  | 'days_after_enrollment'
  | 'manual';

export interface CourseModule {
  uuid: string;
  courseUuid: string;
  title: string;
  description: string;
  status: ContentStatus;
  sortOrder: number;
  durationMinutes: number;
  isCollapsed: boolean;
  unlockRule: UnlockRule;
  unlockDate?: string;
  unlockAfterDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonContent {
  videoSource?: string;
  videoUrl?: string;
  videoDeliveryMode?: 'standard' | 'adaptive';
  fileUrl?: string;
  externalUrl?: string;
  embedCode?: string;
  textContent?: string;
  downloadable?: boolean;
  allowDownload?: boolean;
  thumbnailUrl?: string;
  captionsUrl?: string;
  transcript?: string;
  minimumWatchPercentage?: number;
  minimumWatchMinutes?: number;
  preventSkipping?: boolean;
  completeBeforeNext?: boolean;
  quizUuid?: string;
  assignmentUuid?: string;
  liveClassUrl?: string;
  scheduledAt?: string;
}

export interface CourseLessonSubsection {
  uuid: string;
  lessonUuid: string;
  title: string;
  description?: string;
  type: LessonType;
  status: ContentStatus;
  sortOrder: number;
  durationMinutes: number;
  isDemo?: boolean;
  unlockRule?: UnlockRule;
  unlockDate?: string;
  unlockAfterDays?: number;
  content?: LessonContent;
  createdAt: string;
  updatedAt: string;
}

export interface CourseLesson {
  uuid: string;
  courseUuid: string;
  moduleUuid: string;
  title: string;
  description: string;
  type: LessonType;
  status: ContentStatus;
  sortOrder: number;
  durationMinutes: number;
  isDemo: boolean;
  unlockRule: UnlockRule;
  unlockDate?: string;
  unlockAfterDays?: number;
  content: LessonContent;
  subsections?: CourseLessonSubsection[];
  createdAt: string;
  updatedAt: string;
}

export type CreateModuleInput = Omit<
  CourseModule,
  'uuid' | 'courseUuid' | 'sortOrder' | 'createdAt' | 'updatedAt'
>;

export type UpdateModuleInput = Partial<CreateModuleInput>;

export type CreateLessonInput = Omit<
  CourseLesson,
  'uuid' | 'courseUuid' | 'moduleUuid' | 'sortOrder' | 'createdAt' | 'updatedAt'
>;

export type UpdateLessonInput = Partial<CreateLessonInput>;

export type CreateSubsectionInput = Omit<
  CourseLessonSubsection,
  'uuid' | 'lessonUuid' | 'sortOrder' | 'createdAt' | 'updatedAt'
>;

export type UpdateSubsectionInput = Partial<CreateSubsectionInput>;

// Compatibility types for legacy component interfaces
export type LessonStatus = ContentStatus;
export type UnlockRuleType = UnlockRule;

export interface LessonUnlockRule {
  type: UnlockRule;
  minWatchPercent?: number;
  passingScore?: number;
  scheduledDate?: string;
  daysAfterEnrollment?: number;
}

export interface CurriculumLesson extends CourseLesson {
  id: string; // Alias for uuid
}

export interface CurriculumModule extends CourseModule {
  id: string; // Alias for uuid
  lessons: CurriculumLesson[];
}

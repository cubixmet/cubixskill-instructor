export type ContentStatus =
  | 'draft'
  | 'published'
  | 'scheduled'
  | 'archived';

export type LessonType =
  | 'video'
  | 'audio'
  | 'document'
  | 'text'
  | 'image'
  | 'quiz'
  | 'assignment'
  | 'project';

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
  durationMinutes?: number;
  isCollapsed?: boolean;
  unlockRule?: UnlockRule;
  unlockDate?: string;
  unlockAfterDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonResourceAttachment {
  id: string;
  name: string;
  title?: string;
  description?: string;
  type: 'video' | 'audio' | 'document' | 'image' | 'web_link' | 'archive' | 'other' | string;
  url: string;
  sizeMb?: number;
  provider?: string;
  allowDownload?: boolean;
  attachedAt: string;
  mediaAssetId?: string;
}

export interface LessonContent {
  videoSource?: string;
  videoUrl?: string;
  audioUrl?: string;
  streamUrl?: string;
  videoDeliveryMode?: 'standard' | 'adaptive';
  mediaUrl?: string;
  fileUrl?: string;
  fileName?: string;
  externalUrl?: string;
  embedCode?: string;
  textContent?: string;
  body?: string;
  article?: string;
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
  resources?: LessonResourceAttachment[];
  sourceMode?: 'UPLOAD' | 'URL';
  mediaFileId?: string | null;
  mediaFile?: { id?: string; original_filename?: string; file_size?: number; url: string } | null;
  instructions?: string;
  maxScore?: number;
  submissionType?: 'file' | 'text' | 'both';
  questions?: Record<string, unknown>[];
  quizPayload?: CreateQuizInput;
  quiz?: Record<string, any>;
  assignmentPayload?: CreateAssignmentInput;
  assignment?: Record<string, any>;
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
  id?: string;
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
  is_locked?: boolean;
  isLocked?: boolean;
  allowDownload?: boolean;
  external_url?: string;
  video_url?: string;
  audio_url?: string;
  stream_url?: string;
  primary_media?: Record<string, any> | null;
  media_files?: Record<string, any>[];
  question_count?: number;
  quiz?: Record<string, any> | null;
  unlockRule?: UnlockRule;
  unlockDate?: string;
  unlockAfterDays?: number;
  content: LessonContent;
  resources?: LessonResourceAttachment[];
  subsections?: CourseLessonSubsection[];
  createdAt: string;
  updatedAt: string;
}

export type CreateModuleInput = Omit<
  CourseModule,
  'uuid' | 'courseUuid' | 'sortOrder' | 'createdAt' | 'updatedAt'
>;

export type UpdateModuleInput = Partial<CreateModuleInput>;

export interface CreateQuizOptionInput {
  option_text: string;
  is_correct: boolean;
}

export interface CreateQuizQuestionInput {
  questionText: string;
  question_type: string;
  points?: number;
  explanation?: string;
  answer_text?: string;
  options?: CreateQuizOptionInput[];
}

export interface CreateQuizInput {
  title: string;
  instructions?: string;
  passingScore?: number;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  shuffleQuestions?: boolean;
  showResult?: boolean;
  questions: CreateQuizQuestionInput[];
}

export interface CreateAssignmentAssetInput {
  media_file_id: string;
  title?: string;
  asset_type?: string;
  description?: string;
}

export interface CreateAssignmentInput {
  title?: string;
  instructions: string;
  due_date?: string | null;
  dueDate?: string | null;
  max_marks?: number;
  maxScore?: number;
  allow_text_submission?: boolean;
  allow_file_submission?: boolean;
  allow_url_submission?: boolean;
  assets?: CreateAssignmentAssetInput[];
}

export interface CreateLessonInput {
  title: string;
  type: LessonType;
  description?: string;
  status?: ContentStatus;
  durationMinutes?: number;
  isDemo?: boolean;
  is_locked?: boolean;
  isLocked?: boolean;
  allowDownload?: boolean;
  external_url?: string;
  content?: LessonContent;
  quizPayload?: CreateQuizInput;
  assignmentPayload?: CreateAssignmentInput;
}

export type UpdateLessonInput = Partial<CreateLessonInput>;

export type CreateSubsectionInput = Omit<
  CourseLessonSubsection,
  'uuid' | 'lessonUuid' | 'sortOrder' | 'createdAt' | 'updatedAt'
>;

export type UpdateSubsectionInput = Partial<CreateSubsectionInput>;

// Compatibility types for legacy component interfaces
export type LessonStatus = ContentStatus;
export type UnlockRuleType = UnlockRule;
export type DownloadAssetType = 'pdf' | 'doc' | 'docx' | 'zip' | 'mp4' | 'mp3' | 'other';

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

export type AssignmentStatus = 'Draft' | 'Published' | 'Scheduled' | 'Closed' | 'Archived';

export type SubmissionType =
  | 'text'
  | 'url'
  | 'file'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'zip'
  | 'git'
  | 'gdrive'
  | 'external_url'
  | 'multiple_files';

export type DownloadableFormat =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'zip'
  | 'ppt'
  | 'pptx'
  | 'image'
  | 'audio'
  | 'video';

export type ReviewMode = 'manual' | 'auto_approval';

export type SubmissionStatus =
  | 'Not Submitted'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Resubmission Requested'
  | 'Passed'
  | 'Failed'
  | 'Late';

export type LateSubmissionRule = 'allow' | 'deduct_percentage' | 'reject';

export type LearningUnlockRule = 'unlock_on_submission' | 'unlock_on_approval' | 'unlock_on_passing';

export type ProgressRule =
  | 'lesson_unlock'
  | 'module_unlock'
  | 'exam_unlock'
  | 'certificate_unlock'
  | 'completion_only'
  | 'no_approval_required'
  | 'unlock_next_lesson'
  | 'unlock_next_module'
  | 'require_passing_marks';

export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  maxMarks: number;
}

export interface FileUploadSettings {
  maxFileSizeMb: number;
  allowedExtensions: string[];
  maxFiles: number;
  allowReplace: boolean;
  allowMultipleFiles: boolean;
}

export interface ResubmissionSettings {
  allowResubmission: boolean;
  maxResubmissions: number;
  reasonRequired: boolean;
  autoLockAfterLimit: boolean;
}

export interface Assignment {
  id: string; // assignmentUuid
  courseUuid: string;
  courseTitle?: string;
  title: string;
  shortDescription: string;
  instructions: string;
  maxMarks: number;
  passingMarks: number;
  dueDate: string;
  dueTime?: string;
  maxAttempts: number;
  submissionOpeningDate: string;
  submissionClosingDate: string;
  status: AssignmentStatus;

  // Submission Rules & Types
  allowedSubmissionTypes: SubmissionType[];
  fileUploadSettings?: FileUploadSettings;
  reviewMode: ReviewMode;
  lateSubmissionRule: LateSubmissionRule;
  lateDeductionPercent?: number;
  allowResubmission: boolean;
  resubmissionSettings?: ResubmissionSettings;
  requirePassingMarks: boolean;
  notifyStudentAfterReview: boolean;

  // Learning Progress Rules & Approval Workflow
  approvalWorkflow: 'auto_approve' | 'auto_approval' | 'manual_review';
  progressRules: ProgressRule[];
  unlockRule: LearningUnlockRule;

  // Media Credit Notice & File Config
  mediaCreditRule?: {
    maxFileMb: number;
    allowedTypes: string[];
    estMediaCredits: number;
  };

  // Downloadable Template
  templateFileName?: string;
  templateFormat?: DownloadableFormat;
  templateUrl?: string;

  // Rubric
  rubric: RubricCriterion[];

  // Stats
  totalSubmissionsCount?: number;
  pendingReviewsCount?: number;
}

export interface SubmissionFile {
  id: string;
  name: string;
  sizeMb: number;
  url: string;
  format: DownloadableFormat | string;
}

export interface ReviewHistoryEntry {
  id: string;
  timestamp: string;
  action: SubmissionStatus | 'Submitted' | 'Reviewed' | 'Grade Updated' | string;
  reviewerName: string;
  marksAwarded?: number;
  feedback?: string;
  privateNotes?: string;
}

export interface StudentSubmission {
  id: string; // submissionUuid
  assignmentUuid: string;
  courseUuid: string;
  studentUuid: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  studentAvatarUrl?: string;
  submittedAt: string;
  submissionDate?: string;
  dueDate?: string;
  attemptNumber: number;
  status: SubmissionStatus;
  submissionType: SubmissionType;

  assignmentTitle?: string;
  courseTitle?: string;
  isLate?: boolean;
  lateDurationFormatted?: string;
  maxAttempts?: number;

  // Content
  textContent?: string;
  submittedText?: string;
  externalUrl?: string;
  files: SubmissionFile[];
  submittedFiles?: SubmissionFile[];

  // Evaluation
  grade?: number;
  marksAwarded?: number;
  maxMarks?: number;
  passingMarks?: number;
  feedback?: string;
  writtenFeedback?: string;
  privateNotes?: string;
  evaluatedAt?: string;
  evaluatedBy?: string;
  reviewerName?: string;
  rubricScores?: Record<string, number>;
  reviewFileUrl?: string;
  reviewAudioUrl?: string;
  reviewVideoUrl?: string;
  reviewHistory?: ReviewHistoryEntry[];
}

export type Submission = StudentSubmission;


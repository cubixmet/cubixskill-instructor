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
  | 'gdrive';

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
  | 'no_approval_required';

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
  approvalWorkflow: 'auto_approve' | 'manual_review';
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

export interface StudentSubmission {
  id: string; // submissionUuid
  assignmentUuid: string;
  courseUuid: string;
  studentUuid: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  submittedAt: string;
  attemptNumber: number;
  status: SubmissionStatus;
  submissionType: SubmissionType;

  // Content
  textContent?: string;
  externalUrl?: string;
  files: SubmissionFile[];

  // Evaluation
  grade?: number;
  feedback?: string;
  privateNotes?: string;
  evaluatedAt?: string;
  evaluatedBy?: string;
  rubricScores?: Record<string, number>;
  reviewFileUrl?: string;
  reviewAudioUrl?: string;
  reviewVideoUrl?: string;
}

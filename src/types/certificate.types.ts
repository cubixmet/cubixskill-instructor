export type CertificateType = 'uploaded_template' | 'custom_builder';

export type CertificateStatus = 'Draft' | 'Active' | 'Archived';

export type AutoIssueRule =
  | 'immediate'
  | 'course_completion'
  | 'passing_quiz'
  | 'assignment_approval'
  | 'manual';

export type CanvasSizeType = 'a4_landscape' | 'a4_portrait' | 'letter';

export type PlaceholderKey =
  | '{{student_name}}'
  | '{{student_id}}'
  | '{{course_name}}'
  | '{{course_category}}'
  | '{{course_level}}'
  | '{{instructor_name}}'
  | '{{academy_name}}'
  | '{{certificate_number}}'
  | '{{issue_date}}'
  | '{{completion_date}}'
  | '{{duration}}'
  | '{{credits_earned}}'
  | '{{grade}}'
  | '{{score}}'
  | '{{percentage}}'
  | '{{qr_code}}'
  | '{{verification_url}}'
  | '{{academy_logo}}'
  | '{{instructor_signature}}'
  | '{{director_signature}}'
  | '{{custom_text}}';

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'qr_code' | 'signature' | 'logo' | 'placeholder';
  label: string;
  placeholderKey?: PlaceholderKey;
  text?: string;
  imageUrl?: string;
  x: number; // percentage (0-100) or pixels
  y: number; // percentage (0-100) or pixels
  width: number;
  height: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  fontColor: string;
  textAlign: 'left' | 'center' | 'right';
  opacity: number;
  isLocked: boolean;
}

export interface AutoIssueConditions {
  requireCourseCompletion: boolean;
  requireAllLessons: boolean;
  requireQuizPassed: boolean;
  requireAssignmentsApproved: boolean;
  minPassingPercentage: number;
  requireFinalExam: boolean;
  requireManualApproval: boolean;
}

export const DEFAULT_AUTO_ISSUE_CONDITIONS: AutoIssueConditions = {
  requireCourseCompletion: true,
  requireAllLessons: false,
  requireQuizPassed: false,
  requireAssignmentsApproved: false,
  minPassingPercentage: 70,
  requireFinalExam: false,
  requireManualApproval: false,
};

export const mapAutoIssueConditions = (
  selectedConditions?: string[] | Partial<AutoIssueConditions> | null,
  options?: { minPassingPercentage?: number }
): AutoIssueConditions => {
  if (!selectedConditions) return { ...DEFAULT_AUTO_ISSUE_CONDITIONS };
  if (Array.isArray(selectedConditions)) {
    return {
      requireCourseCompletion: selectedConditions.includes('course_completion') || selectedConditions.includes('requireCourseCompletion'),
      requireAllLessons: selectedConditions.includes('all_lessons') || selectedConditions.includes('requireAllLessons'),
      requireQuizPassed: selectedConditions.includes('quiz_passed') || selectedConditions.includes('requireQuizPassed'),
      requireAssignmentsApproved: selectedConditions.includes('assignments_approved') || selectedConditions.includes('requireAssignmentsApproved'),
      minPassingPercentage: options?.minPassingPercentage ?? 70,
      requireFinalExam: selectedConditions.includes('final_exam') || selectedConditions.includes('requireFinalExam'),
      requireManualApproval: selectedConditions.includes('manual_approval') || selectedConditions.includes('requireManualApproval'),
    };
  }
  return {
    ...DEFAULT_AUTO_ISSUE_CONDITIONS,
    ...selectedConditions,
    minPassingPercentage: selectedConditions.minPassingPercentage ?? options?.minPassingPercentage ?? 70,
  };
};

export interface CertificateTemplate {
  id: string;
  courseUuid: string;
  title: string;
  description: string;
  type: CertificateType;
  status: CertificateStatus;
  autoIssueRule: AutoIssueRule;
  autoIssueConditions: AutoIssueConditions;
  version: number;
  canvasSize: CanvasSizeType;
  backgroundUrl?: string;
  backgroundColor?: string;
  elements: CanvasElement[];
  issuedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssuedCertificate {
  id: string; // Certificate Number e.g. CERT-2026-8841
  templateId: string;
  templateVersion: number;
  courseUuid: string;
  studentUuid: string;
  studentName: string;
  studentEmail: string;
  issuedAt: string;
  completionDate: string;
  status: 'issued' | 'revoked' | 'pending';
  qrVerificationUrl: string;
  pdfDownloadUrl?: string;
  downloadCount: number;
  verificationScanCount: number;
}

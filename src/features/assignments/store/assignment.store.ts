import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Assignment, StudentSubmission } from '../../../types/assignment.types';
import { MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS } from '../data/mockAssignments';

interface AssignmentStoreState {
  assignments: Assignment[];
  submissions: StudentSubmission[];

  // Assignment Actions
  getAssignmentsByCourse: (courseUuid?: string) => Assignment[];
  getAssignmentByUuid: (uuid: string) => Assignment | undefined;
  addAssignment: (data: Partial<Assignment>) => Assignment;
  updateAssignment: (uuid: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (uuid: string) => void;
  duplicateAssignment: (uuid: string) => void;
  archiveAssignment: (uuid: string) => void;
  publishAssignment: (uuid: string) => void;

  // Submission Review Actions
  getSubmissionsByAssignment: (assignmentUuid: string) => StudentSubmission[];
  getSubmissionByUuid: (submissionUuid: string) => StudentSubmission | undefined;
  approveSubmission: (submissionUuid: string, grade?: number, feedback?: string) => void;
  rejectSubmission: (submissionUuid: string, feedback?: string) => void;
  requestResubmission: (submissionUuid: string, feedback?: string) => void;
}

export const useAssignmentStore = create<AssignmentStoreState>()(
  persist(
    (set, get) => ({
      assignments: MOCK_ASSIGNMENTS as unknown as Assignment[],
      submissions: MOCK_SUBMISSIONS as unknown as StudentSubmission[],

      getAssignmentsByCourse: (courseUuid) => {
        const { assignments } = get();
        if (!courseUuid) return assignments;
        return assignments.filter((a) => a.courseUuid === courseUuid);
      },

      getAssignmentByUuid: (uuid) => {
        return get().assignments.find((a) => a.id === uuid);
      },

      addAssignment: (data) => {
        const newAssignment: Assignment = {
          id: `assign-${Date.now()}`,
          courseUuid: data.courseUuid || '',
          courseTitle: data.courseTitle || 'Fullstack React 19 & Next.js 15 Masterclass',
          title: data.title || 'Untitled Assignment',
          shortDescription: data.shortDescription || '',
          instructions: data.instructions || '',
          maxMarks: data.maxMarks || 100,
          passingMarks: data.passingMarks || 75,
          dueDate: data.dueDate || new Date().toISOString(),
          maxAttempts: data.maxAttempts || 3,
          submissionOpeningDate: data.submissionOpeningDate || new Date().toISOString(),
          submissionClosingDate: data.submissionClosingDate || new Date().toISOString(),
          status: data.status || 'Published',
          allowedSubmissionTypes: data.allowedSubmissionTypes || ['file', 'text', 'url'],
          reviewMode: data.reviewMode || 'manual',
          approvalWorkflow: data.approvalWorkflow || 'manual_review',
          lateSubmissionRule: 'deduct_percentage',
          allowResubmission: true,
          requirePassingMarks: true,
          notifyStudentAfterReview: true,
          progressRules: data.progressRules || ['lesson_unlock'],
          unlockRule: 'unlock_on_approval',
          rubric: data.rubric || [],
          totalSubmissionsCount: 0,
          pendingReviewsCount: 0,
        };

        set((state) => ({
          assignments: [newAssignment, ...state.assignments],
        }));

        return newAssignment;
      },

      updateAssignment: (uuid, updates) => {
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === uuid ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteAssignment: (uuid) => {
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== uuid),
        }));
      },

      duplicateAssignment: (uuid) => {
        const existing = get().getAssignmentByUuid(uuid);
        if (!existing) return;

        const duplicated: Assignment = {
          ...existing,
          id: `assign-${Date.now()}`,
          title: `${existing.title} (Copy)`,
          status: 'Draft',
          totalSubmissionsCount: 0,
          pendingReviewsCount: 0,
        };

        set((state) => ({
          assignments: [duplicated, ...state.assignments],
        }));
      },

      archiveAssignment: (uuid) => {
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === uuid ? { ...a, status: 'Archived' } : a
          ),
        }));
      },

      publishAssignment: (uuid) => {
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === uuid ? { ...a, status: 'Published' } : a
          ),
        }));
      },

      getSubmissionsByAssignment: (assignmentUuid) => {
        return get().submissions.filter((s) => s.assignmentUuid === assignmentUuid);
      },

      getSubmissionByUuid: (submissionUuid) => {
        return get().submissions.find((s) => s.id === submissionUuid);
      },

      approveSubmission: (submissionUuid, grade, feedback) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionUuid
              ? {
                  ...s,
                  status: 'Approved',
                  grade: grade !== undefined ? grade : s.grade || 90,
                  feedback: feedback || s.feedback || 'Approved by instructor.',
                  evaluatedAt: new Date().toISOString(),
                }
              : s
          ),
        }));
      },

      rejectSubmission: (submissionUuid, feedback) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionUuid
              ? {
                  ...s,
                  status: 'Rejected',
                  feedback: feedback || 'Submission does not meet criteria.',
                  evaluatedAt: new Date().toISOString(),
                }
              : s
          ),
        }));
      },

      requestResubmission: (submissionUuid, feedback) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionUuid
              ? {
                  ...s,
                  status: 'Resubmission Requested',
                  feedback: feedback || 'Please resubmit with requested improvements.',
                  evaluatedAt: new Date().toISOString(),
                }
              : s
          ),
        }));
      },
    }),
    {
      name: 'cubixskill-assignment-store',
    }
  )
);

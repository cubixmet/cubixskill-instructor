import { isValidCourseId } from './courseValidation.utils';

export const courseRoutes = {
  overview: (courseId?: string | null) =>
    isValidCourseId(courseId) ? `/courses/${courseId.trim()}/overview` : '/courses',
  curriculum: (courseId?: string | null) =>
    isValidCourseId(courseId) ? `/courses/${courseId.trim()}/curriculum` : '/courses',
  students: (courseId?: string | null, studentUuid?: string | null) =>
    isValidCourseId(courseId)
      ? studentUuid
        ? `/courses/${courseId.trim()}/students/${studentUuid}`
        : `/courses/${courseId.trim()}/students`
      : '/students',
  discussions: {
    base: (courseId?: string | null) =>
      isValidCourseId(courseId) ? `/courses/${courseId.trim()}/discussions` : '/discussions',
    community: (courseId?: string | null, threadId?: string | null) =>
      isValidCourseId(courseId)
        ? threadId
          ? `/courses/${courseId.trim()}/discussions/community/${threadId}`
          : `/courses/${courseId.trim()}/discussions/community`
        : threadId
        ? `/discussions/community/${threadId}`
        : '/discussions/community',
    personal: (courseId?: string | null, studentUuid?: string | null) =>
      isValidCourseId(courseId)
        ? studentUuid
          ? `/courses/${courseId.trim()}/discussions/personal/${studentUuid}`
          : `/courses/${courseId.trim()}/discussions/personal`
        : studentUuid
        ? `/discussions/personal/${studentUuid}`
        : '/discussions/personal',
  },
  detail: (courseId?: string | null) =>
    isValidCourseId(courseId) ? `/courses/${courseId.trim()}/overview` : '/courses',
  liveSessions: (courseId?: string | null) =>
    isValidCourseId(courseId) ? `/courses/${courseId.trim()}/live-sessions` : '/live-classes',
  reports: (courseId?: string | null) =>
    isValidCourseId(courseId) ? `/courses/${courseId.trim()}/reports` : '/courses',
  settings: (courseId?: string | null) =>
    isValidCourseId(courseId) ? `/courses/${courseId.trim()}/settings` : '/courses',
};

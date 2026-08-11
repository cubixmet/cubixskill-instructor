import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CourseFeaturesConfig {
  // Learning Content Features
  lessons: boolean;
  videoLessons: boolean;
  audioLessons: boolean;
  pdfLessons: boolean;
  documentLessons: boolean;
  textLessons: boolean;
  imageLessons: boolean;
  downloadableAssets: boolean;
  externalUrlLessons: boolean;
  embedLessons: boolean;
  liveClasses: boolean;

  // Assessment Features
  quizzes: boolean;
  assignments: boolean;
  examMode: boolean;
  randomQuestions: boolean;
  manualAssignmentReview: boolean;
  codingAssignments: boolean;

  // Certificate Features
  courseCertificates: boolean;
  qrVerification: boolean;
  customCertificateDesigner: boolean;

  // Fee & Billing Features
  feeCollection: boolean;

  // Learning Control Features
  sequentialLearning: boolean;
  lessonLocking: boolean;
  moduleLocking: boolean;
  videoCompletionRequired: boolean;
  quizUnlock: boolean;
  assignmentUnlock: boolean;
  dripContent: boolean;
  scheduledRelease: boolean;

  // Communication & Student Features
  studentNotes: boolean;
  courseAnnouncements: boolean;
  courseDiscussion: boolean;
  courseChat: boolean;
  liveSessions: boolean;
  events: boolean;
  courseFeed: boolean;
  notifications: boolean;

  // Reports & Analytics Features
  studentReports: boolean;
  courseReports: boolean;
  lessonReports: boolean;
  quizReports: boolean;
  assignmentReports: boolean;
  videoReports: boolean;
  certificateReports: boolean;
  creditReports: boolean;

  // Premium Features
  whiteLabel: boolean;
  customDomain: boolean;
  apiAccess: boolean;
  advancedAnalytics: boolean;
  teamManagement: boolean;
  prioritySupport: boolean;
}

export const DEFAULT_COURSE_FEATURES: CourseFeaturesConfig = {
  // Learning Content Features
  lessons: true,
  videoLessons: true,
  audioLessons: true,
  pdfLessons: true,
  documentLessons: true,
  textLessons: true,
  imageLessons: true,
  downloadableAssets: true,
  externalUrlLessons: true,
  embedLessons: true,
  liveClasses: true,

  // Assessment Features
  quizzes: true,
  assignments: true,
  examMode: true,
  randomQuestions: true,
  manualAssignmentReview: true,
  codingAssignments: true,

  // Certificate Features
  courseCertificates: true,
  qrVerification: true,
  customCertificateDesigner: true,

  // Fee & Billing Features
  feeCollection: true,

  // Learning Control Features
  sequentialLearning: true,
  lessonLocking: true,
  moduleLocking: true,
  videoCompletionRequired: true,
  quizUnlock: true,
  assignmentUnlock: true,
  dripContent: true,
  scheduledRelease: true,

  // Communication & Student Features
  studentNotes: true,
  courseAnnouncements: true,
  courseDiscussion: true,
  courseChat: true,
  liveSessions: true,
  events: true,
  courseFeed: true,
  notifications: true,

  // Reports & Analytics Features
  studentReports: true,
  courseReports: true,
  lessonReports: true,
  quizReports: true,
  assignmentReports: true,
  videoReports: true,
  certificateReports: true,
  creditReports: true,

  // Premium Features
  whiteLabel: false,
  customDomain: false,
  apiAccess: false,
  advancedAnalytics: true,
  teamManagement: true,
  prioritySupport: true,
};

interface CourseFeaturesState {
  featuresByCourse: Record<string, CourseFeaturesConfig>;
  getCourseFeatures: (courseUuid: string) => CourseFeaturesConfig;
  updateCourseFeatures: (courseUuid: string, features: Partial<CourseFeaturesConfig>) => void;
  toggleFeature: (courseUuid: string, key: keyof CourseFeaturesConfig) => void;
}

export const useCourseFeaturesStore = create<CourseFeaturesState>()(
  persist(
    (set, get) => ({
      featuresByCourse: {
        '550e8400-e29b-41d4-a716-446655440000': DEFAULT_COURSE_FEATURES,
      },

      getCourseFeatures: (courseUuid) => {
        return get().featuresByCourse[courseUuid] || DEFAULT_COURSE_FEATURES;
      },

      updateCourseFeatures: (courseUuid, updates) => {
        set((state) => {
          const current = state.featuresByCourse[courseUuid] || DEFAULT_COURSE_FEATURES;
          return {
            featuresByCourse: {
              ...state.featuresByCourse,
              [courseUuid]: { ...current, ...updates },
            },
          };
        });
      },

      toggleFeature: (courseUuid, key) => {
        set((state) => {
          const current = state.featuresByCourse[courseUuid] || DEFAULT_COURSE_FEATURES;
          return {
            featuresByCourse: {
              ...state.featuresByCourse,
              [courseUuid]: { ...current, [key]: !current[key] },
            },
          };
        });
      },
    }),
    {
      name: 'cubixskill-course-features-store-v2',
    }
  )
);

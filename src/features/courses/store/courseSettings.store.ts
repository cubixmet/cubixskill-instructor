import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CourseSettingsConfig {
  // 1. Basic Information
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  language: string;
  estimatedDurationHours: number;
  instructorName: string;

  // 2. Access & Visibility
  visibility: 'Public' | 'Unlisted' | 'Private';
  accessType: 'Free' | 'Paid' | 'Invite Only' | 'Internal';
  accessMode: 'Lifetime Access' | 'Fixed Duration' | 'Specific Expiry Date';
  allowPreview: boolean;
  requireLogin: boolean;

  // 3. Enrollment
  enrollmentOpen: boolean;
  maxStudents: number;
  autoApproval: boolean;
  allowReEnrollment: boolean;

  // 4. Pricing
  currency: string;
  price: number;
  discountPrice: number;
  allowCoupons: boolean;
  allowRefunds: boolean;

  // 5. Learning Rules
  sequentialLearning: boolean;
  preventVideoSkipping: boolean;
  minVideoWatchPercent: number;

  // 6. Media Defaults
  defaultVideoUploadMode: 'Standard Upload' | 'Adaptive Streaming';
  allowVideoDownload: boolean;

  // 7. Assignment Defaults
  maxAssignmentAttempts: number;
  allowLateSubmissions: boolean;

  // 8. Quiz Defaults
  passingGradePercent: number;
  maxQuizAttempts: number;
  shuffleQuestions: boolean;

  // 9. Certificate Defaults
  autoGenerateCertificate: boolean;

  // 10. Discussions & Chat Defaults
  allowStudentTopics: boolean;
  allowStudentAttachments: boolean;

  // 11. Announcements Defaults
  announcementEmailNotify: boolean;

  // 12. Live Sessions Defaults
  defaultLiveProvider: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Jitsi' | 'Custom';
  enableWaitingRoom: boolean;

  // 13. Notifications
  notifyOnEnrollment: boolean;
  notifyOnAssignmentSubmit: boolean;
  notifyOnQuizComplete: boolean;

  // 14. SEO
  seoTitle: string;
  metaDescription: string;
  keywords: string;

  // 15. Publishing
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  scheduledPublishDate?: string;

  updatedAt: string;
}

export const DEFAULT_COURSE_SETTINGS: CourseSettingsConfig = {
  title: 'Full Stack Web Development Architecture',
  shortDescription: 'Master modern React 19, Node.js, and Cloud Infrastructure.',
  fullDescription: 'Comprehensive end-to-end full stack architecture masterclass covering frontend, backend, databases, and DevOps.',
  category: 'Web Development',
  subcategory: 'Full Stack',
  level: 'Intermediate',
  language: 'English',
  estimatedDurationHours: 42,
  instructorName: 'Dr. Vikramaditya Rao',

  visibility: 'Public',
  accessType: 'Paid',
  accessMode: 'Lifetime Access',
  allowPreview: true,
  requireLogin: true,

  enrollmentOpen: true,
  maxStudents: 1000,
  autoApproval: true,
  allowReEnrollment: true,

  currency: 'INR',
  price: 4999,
  discountPrice: 2999,
  allowCoupons: true,
  allowRefunds: true,

  sequentialLearning: true,
  preventVideoSkipping: false,
  minVideoWatchPercent: 80,

  defaultVideoUploadMode: 'Standard Upload',
  allowVideoDownload: false,

  maxAssignmentAttempts: 3,
  allowLateSubmissions: true,

  passingGradePercent: 75,
  maxQuizAttempts: 5,
  shuffleQuestions: true,

  autoGenerateCertificate: true,

  allowStudentTopics: true,
  allowStudentAttachments: true,

  announcementEmailNotify: true,

  defaultLiveProvider: 'Zoom',
  enableWaitingRoom: true,

  notifyOnEnrollment: true,
  notifyOnAssignmentSubmit: true,
  notifyOnQuizComplete: true,

  seoTitle: 'Full Stack Web Development Architecture Masterclass | CubixSkill',
  metaDescription: 'Learn full-stack web development with React 19, TypeScript, and Node.js.',
  keywords: 'fullstack, react, typescript, nodejs, cubixskill',

  status: 'published',
  updatedAt: new Date().toISOString(),
};

interface CourseSettingsStoreState {
  settingsByCourse: Record<string, CourseSettingsConfig>;

  getCourseSettings: (courseUuid: string) => CourseSettingsConfig;
  updateCourseSettings: (courseUuid: string, settings: Partial<CourseSettingsConfig>) => void;
  resetCourseSettings: (courseUuid: string) => void;
}

export const useCourseSettingsStore = create<CourseSettingsStoreState>()(
  persist(
    (set, get) => ({
      settingsByCourse: {},

      getCourseSettings: (courseUuid) => {
        return get().settingsByCourse[courseUuid] || DEFAULT_COURSE_SETTINGS;
      },

      updateCourseSettings: (courseUuid, updates) => {
        set((state) => {
          const current = state.settingsByCourse[courseUuid] || DEFAULT_COURSE_SETTINGS;
          return {
            settingsByCourse: {
              ...state.settingsByCourse,
              [courseUuid]: {
                ...current,
                ...updates,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      resetCourseSettings: (courseUuid) => {
        set((state) => ({
          settingsByCourse: {
            ...state.settingsByCourse,
            [courseUuid]: DEFAULT_COURSE_SETTINGS,
          },
        }));
      },
    }),
    {
      name: 'cubixskill_course_settings_store_v1',
    }
  )
);

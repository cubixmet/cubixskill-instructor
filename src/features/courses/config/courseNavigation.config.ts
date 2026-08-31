import React from 'react';
import { matchPath } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Video,
  Settings,
  SlidersHorizontal,
  Ticket,
  IndianRupee,
} from 'lucide-react';

export type CourseNavGroupId = 'CORE' | 'LEARNING' | 'ENGAGEMENT' | 'MANAGEMENT';

export interface CourseNavSection {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  route: string;
  group: CourseNavGroupId;
  priority: 1 | 2; // 1 = Primary desktop tab, 2 = Secondary (More menu)
  requiredFeature?: string;
  matchPatterns: string[];
}

export const COURSE_NAV_GROUPS: { id: CourseNavGroupId; label: string }[] = [
  { id: 'CORE', label: 'Core Overview' },
  { id: 'LEARNING', label: 'Learning Content' },
  { id: 'ENGAGEMENT', label: 'Student Engagement' },
  { id: 'MANAGEMENT', label: 'Course Management' },
];

export const COURSE_NAV_SECTIONS: CourseNavSection[] = [
  // 1. Overview
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    route: 'overview',
    group: 'CORE',
    priority: 1,
    matchPatterns: [
      '/courses/:courseId',
      '/courses/:courseId/overview',
    ],
  },
  // 2. Curriculum
  {
    id: 'curriculum',
    label: 'Curriculum',
    icon: BookOpen,
    route: 'curriculum',
    group: 'CORE',
    priority: 1,
    matchPatterns: [
      '/courses/:courseId/curriculum',
      '/courses/:courseId/curriculum/modules/new',
      '/courses/:courseId/curriculum/modules/:moduleId/edit',
      '/courses/:courseId/curriculum/lessons/select-type',
      '/courses/:courseId/curriculum/lessons/new',
      '/courses/:courseId/curriculum/lessons/:lessonId/edit',
      '/courses/:courseId/curriculum/quizzes/new',
      '/courses/:courseId/curriculum/quizzes/:quizId/edit',
      '/courses/:courseId/curriculum/lessons/:lessonId/resources',
      '/courses/:courseId/curriculum/resources/add',
      // Legacy redirects
      '/courses/:courseId/modules/create',
      '/courses/:courseId/modules/:moduleId/lessons/create',
      '/courses/:courseId/modules/:moduleId/lessons/:lessonId/edit',
      '/courses/:courseId/modules/:moduleId/lessons/:lessonId/resources',
      '/courses/:courseId/modules/:moduleId/lessons/create/type',
    ],
  },
  // 3. Students
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    route: 'students',
    group: 'CORE',
    priority: 1,
    matchPatterns: [
      '/courses/:courseId/students',
      '/courses/:courseId/students/enroll',
      '/courses/:courseId/students/bulk-upload',
      '/courses/:courseId/students/:studentId',
      '/courses/:courseId/students/:studentId/overview',
    ],
  },
  // 4. Live Sessions
  {
    id: 'live-sessions',
    label: 'Live Sessions',
    icon: Video,
    route: 'live-sessions',
    group: 'LEARNING',
    priority: 1,
    requiredFeature: 'LIVE_SESSIONS',
    matchPatterns: [
      '/courses/:courseId/live-sessions',
      '/courses/:courseId/live-sessions/new',
    ],
  },
  // 5. Fees Collection
  {
    id: 'fees',
    label: 'Fees Collection',
    icon: IndianRupee,
    route: 'fees',
    group: 'MANAGEMENT',
    priority: 1,
    requiredFeature: 'FEES',
    matchPatterns: [
      '/courses/:courseId/fees',
    ],
  },
  // 6. Coupons
  {
    id: 'coupons',
    label: 'Coupons',
    icon: Ticket,
    route: 'coupons',
    group: 'MANAGEMENT',
    priority: 1,
    requiredFeature: 'COUPONS',
    matchPatterns: [
      '/courses/:courseId/coupons',
      '/courses/:courseId/coupons/new',
      '/courses/:courseId/coupons/:couponId',
      '/courses/:courseId/coupons/:couponId/edit',
    ],
  },
  // 7. Course Features
  {
    id: 'features',
    label: 'Course Features',
    icon: SlidersHorizontal,
    route: 'features',
    group: 'MANAGEMENT',
    priority: 1,
    matchPatterns: [
      '/courses/:courseId/features',
    ],
  },
  // 8. Settings
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    route: 'settings',
    group: 'MANAGEMENT',
    priority: 1,
    matchPatterns: [
      '/courses/:courseId/settings',
    ],
  },
];

export const isCourseTabActive = (sec: CourseNavSection, pathname: string): boolean => {
  return sec.matchPatterns.some((pattern) =>
    Boolean(
      matchPath(
        {
          path: pattern,
          end: true,
        },
        pathname
      )
    )
  );
};

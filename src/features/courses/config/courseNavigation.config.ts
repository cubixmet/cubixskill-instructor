import React from 'react';
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
  },
  // 2. Curriculum
  {
    id: 'curriculum',
    label: 'Curriculum',
    icon: BookOpen,
    route: 'curriculum',
    group: 'CORE',
    priority: 1,
  },
  // 3. Students
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    route: 'students',
    group: 'CORE',
    priority: 1,
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
  },
  // 7. Course Features
  {
    id: 'features',
    label: 'Course Features',
    icon: SlidersHorizontal,
    route: 'features',
    group: 'MANAGEMENT',
    priority: 1,
  },
  // 8. Settings
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    route: 'settings',
    group: 'MANAGEMENT',
    priority: 1,
  },
];

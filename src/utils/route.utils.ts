import { isValidUuid } from './courseValidation.utils';

export function normalizeId(value: unknown): string | null {
  if (value == null) return null;
  const str = String(value).trim();
  if (!str) return null;
  if (isValidUuid(str)) return str;
  return null;
}

export const routes = {
  dashboard: () => '/dashboard',
  
  // Courses
  courses: () => '/courses',
  courseCategories: () => '/courses/categories',
  courseCreate: () => '/courses/create',
  courseDetail: (courseId: string) => {
    const id = normalizeId(courseId);
    return id ? `/courses/${id}` : '/courses';
  },
  courseOverview: (courseId: string) => {
    const id = normalizeId(courseId);
    return id ? `/courses/${id}/overview` : '/courses';
  },
  courseCurriculum: (courseId: string) => {
    const id = normalizeId(courseId);
    return id ? `/courses/${id}/curriculum` : '/courses';
  },
  courseFeatures: (courseId: string) => {
    const id = normalizeId(courseId);
    return id ? `/courses/${id}/features` : '/courses';
  },
  newModule: (courseId: string) => {
    const id = normalizeId(courseId);
    return id ? `/courses/${id}/curriculum/modules/new` : '/courses';
  },
  editModule: (courseId: string, moduleId: string) => {
    const cId = normalizeId(courseId);
    const mId = normalizeId(moduleId);
    return cId && mId ? `/courses/${cId}/curriculum/modules/${mId}/edit` : '/courses';
  },

  // Students
  students: () => '/students',
  studentCreate: () => '/students/create',
  studentEnroll: () => '/students/enroll',
  studentDetail: (studentId: string) => {
    const id = normalizeId(studentId);
    return id ? `/students/${id}` : '/students';
  },

  // Website Builder
  websiteBuilder: () => '/website-builder',

  // Staff & Roles
  staff: () => '/staff',
  roles: () => '/roles',

  // Credits & Fees
  credits: () => '/credits',
  buyCredits: () => '/credits/buy',
  fees: () => '/fees',

  // Demo Leads
  demoLeads: () => '/demo-leads',

  // Certificates & Coupons & Discussions
  certificates: () => '/certificates',
  discussions: () => '/discussions',
  coupons: () => '/coupons',

  // Settings
  settings: () => '/settings',
};

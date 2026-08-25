import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CourseDetails } from '../types/course.types';

const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'c' + Date.now().toString(16) + Math.random().toString(16).substring(2, 8);
};

const DEFAULT_COURSE: CourseDetails = {
  uuid: '',
  slug: 'fullstack-react-19-typescript-masterclass',
  title: 'Fullstack React 19 & TypeScript Masterclass',
  shortDescription: 'Build enterprise Next.js applications with Zustand, React Query & Tailwind v4.',
  fullDescription: 'Comprehensive guide covering React Server Components, Zustand, and fast deployment.',
  category: 'Web Development',
  subcategory: 'React',
  level: 'Advanced',
  language: 'English',
  durationHours: 4,
  durationMinutes: 35,
  courseType: 'Paid',
  visibility: 'Public',
  tags: ['React', 'TypeScript', 'Next.js', 'Zustand', 'Frontend'],
  instructorName: 'Dr. Rajesh Varma',
  status: 'published',
  thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
  createdAt: '2026-08-01T10:00:00Z',
  updatedAt: '2026-08-05T08:00:00Z',
  enrolledStudentsCount: 420,
  rating: 4.9,
  totalRevenue: 1259580,
  creditsPerStudent: 17,
  isFree: false,
  price: 3499,
};

interface CourseStoreState {
  coursesByUuid: Record<string, CourseDetails>;
  getCourseByUuid: (uuid: string) => CourseDetails;
  addCourse: (
    courseData: Omit<CourseDetails, 'uuid' | 'createdAt' | 'updatedAt' | 'enrolledStudentsCount' | 'rating' | 'totalRevenue'>
  ) => CourseDetails;
  updateCourse: (uuid: string, updates: Partial<CourseDetails>) => void;
  duplicateCourse: (sourceUuid: string, newTitle?: string) => CourseDetails;
  deleteCourse: (uuid: string) => void;
}

export const useCourseStore = create<CourseStoreState>()(
  persist(
    (set, get) => ({
      coursesByUuid: {},

      getCourseByUuid: (uuid) => {
        return get().coursesByUuid[uuid] || { ...DEFAULT_COURSE, uuid };
      },

      addCourse: (data) => {
        const newUuid = generateUuid();
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const newCourse: CourseDetails = {
          ...data,
          uuid: newUuid,
          slug,
          enrolledStudentsCount: 0,
          rating: 5.0,
          totalRevenue: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          coursesByUuid: {
            ...state.coursesByUuid,
            [newUuid]: newCourse,
          },
        }));

        return newCourse;
      },

      updateCourse: (uuid, updates) => {
        set((state) => {
          const current = state.coursesByUuid[uuid] || { ...DEFAULT_COURSE, uuid };
          return {
            coursesByUuid: {
              ...state.coursesByUuid,
              [uuid]: { ...current, ...updates, updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      duplicateCourse: (sourceUuid, newTitle) => {
        const source = get().coursesByUuid[sourceUuid] || DEFAULT_COURSE;
        const newUuid = generateUuid();
        const title = newTitle || `${source.title} — Copy`;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // Deep clone reusable content, resetting all operational/student data
        const duplicatedCourse: CourseDetails = JSON.parse(JSON.stringify({
          ...source,
          uuid: newUuid,
          slug,
          title,
          status: 'draft',
          enrolledStudentsCount: 0,
          rating: 5.0,
          totalRevenue: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        set((state) => ({
          coursesByUuid: {
            [newUuid]: duplicatedCourse,
            ...state.coursesByUuid,
          },
        }));

        return duplicatedCourse;
      },

      deleteCourse: (uuid) => {
        set((state) => {
          const next = { ...state.coursesByUuid };
          delete next[uuid];
          return { coursesByUuid: next };
        });
      },
    }),
    {
      name: 'cubixskill-course-store-v1',
    }
  )
);

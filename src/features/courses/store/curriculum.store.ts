import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CourseModule,
  CourseLesson,
  CourseLessonSubsection,
  CreateModuleInput,
  UpdateModuleInput,
  CreateLessonInput,
  UpdateLessonInput,
  CreateSubsectionInput,
  UpdateSubsectionInput,
} from '../../../types/curriculum.types';

// Helper for crypto UUID generation
const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return '550e8400-e29b-41d4-a716-' + Date.now().toString(16) + Math.random().toString(16).substring(2, 8);
};

interface CurriculumState {
  modules: CourseModule[];
  lessons: CourseLesson[];

  // Module Actions
  addModule: (courseUuid: string, data: CreateModuleInput) => CourseModule;
  updateModule: (moduleUuid: string, data: UpdateModuleInput) => void;
  deleteModule: (moduleUuid: string) => void;
  duplicateModule: (moduleUuid: string) => CourseModule | null;
  reorderModules: (courseUuid: string, orderedModuleUuids: string[]) => void;
  getModulesByCourse: (courseUuid: string) => CourseModule[];

  // Lesson Actions
  addLesson: (courseUuid: string, moduleUuid: string, data: CreateLessonInput) => CourseLesson;
  updateLesson: (lessonUuid: string, data: UpdateLessonInput) => void;
  deleteLesson: (lessonUuid: string) => void;
  duplicateLesson: (lessonUuid: string) => CourseLesson | null;
  moveLesson: (lessonUuid: string, targetModuleUuid: string, targetIndex?: number) => void;
  reorderLessons: (moduleUuid: string, orderedLessonUuids: string[]) => void;
  getLessonsByModule: (moduleUuid: string) => CourseLesson[];

  // Subsection Actions
  addSubsection: (lessonUuid: string, data: CreateSubsectionInput) => CourseLessonSubsection;
  updateSubsection: (lessonUuid: string, subsectionUuid: string, data: UpdateSubsectionInput) => void;
  deleteSubsection: (lessonUuid: string, subsectionUuid: string) => void;
  duplicateSubsection: (lessonUuid: string, subsectionUuid: string) => CourseLessonSubsection | null;
  reorderSubsections: (lessonUuid: string, orderedSubsectionUuids: string[]) => void;
}

// Initial Seed Data (Only loaded when modules array is empty)
const SEED_MODULES: CourseModule[] = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655441001',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Module 1: React 19 Architecture & Server Components',
    description: 'Foundational concepts covering React 19 RSC, Server Actions, and Server Functions.',
    status: 'published',
    sortOrder: 1,
    durationMinutes: 45,
    isCollapsed: false,
    unlockRule: 'immediate',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-04T12:00:00Z',
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655441002',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Module 2: Advanced State Management with Zustand',
    description: 'Global state store initialization, persistent middleware, and slice patterns.',
    status: 'published',
    sortOrder: 2,
    durationMinutes: 30,
    isCollapsed: false,
    unlockRule: 'previous_module',
    createdAt: '2026-08-02T10:00:00Z',
    updatedAt: '2026-08-05T08:00:00Z',
  },
];

const SEED_LESSONS: CourseLesson[] = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655442001',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    moduleUuid: '550e8400-e29b-41d4-a716-446655441001',
    title: '01. React 19 Architecture Overview',
    description: 'Understand RSC boundaries and zero-bundle server components.',
    type: 'video',
    status: 'published',
    sortOrder: 1,
    durationMinutes: 25,
    isDemo: true,
    unlockRule: 'immediate',
    content: {
      videoSource: 'upload',
      videoUrl: 'https://assets.cubixskill.com/videos/react19_rsc.mp4',
      videoDeliveryMode: 'adaptive',
      allowDownload: true,
      preventSkipping: true,
      minimumWatchPercentage: 80,
    },
    subsections: [
      {
        uuid: 'sub-550e8400-1',
        lessonUuid: '550e8400-e29b-41d4-a716-446655442001',
        title: 'Video Introduction: React 19 Paradigms',
        type: 'video',
        status: 'published',
        sortOrder: 1,
        durationMinutes: 10,
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-08-04T12:00:00Z',
      },
      {
        uuid: 'sub-550e8400-2',
        lessonUuid: '550e8400-e29b-41d4-a716-446655442001',
        title: 'RSC Architecture Diagram & Docs',
        type: 'pdf',
        status: 'published',
        sortOrder: 2,
        durationMinutes: 8,
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-08-04T12:00:00Z',
      },
      {
        uuid: 'sub-550e8400-3',
        lessonUuid: '550e8400-e29b-41d4-a716-446655442001',
        title: 'Knowledge Check: Server Components Quiz',
        type: 'quiz',
        status: 'published',
        sortOrder: 3,
        durationMinutes: 7,
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-08-04T12:00:00Z',
      },
    ],
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-04T12:00:00Z',
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655442002',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    moduleUuid: '550e8400-e29b-41d4-a716-446655441001',
    title: '02. Setup Cheat Sheet & Reference Guide',
    description: 'Quick reference sheet for configuring Vite and React 19 environment.',
    type: 'pdf',
    status: 'published',
    sortOrder: 2,
    durationMinutes: 10,
    isDemo: false,
    unlockRule: 'previous_lesson',
    content: {
      fileUrl: 'https://assets.cubixskill.com/docs/react19_cheatsheet.pdf',
      allowDownload: true,
    },
    subsections: [],
    createdAt: '2026-08-01T11:00:00Z',
    updatedAt: '2026-08-04T12:00:00Z',
  },
];

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set, get) => ({
      modules: SEED_MODULES,
      lessons: SEED_LESSONS,

      // MODULE ACTIONS
      addModule: (courseUuid, data) => {
        const courseModules = get()
          .modules.filter((m) => m.courseUuid === courseUuid)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const newModule: CourseModule = {
          ...data,
          uuid: generateUuid(),
          courseUuid,
          sortOrder: courseModules.length + 1,
          durationMinutes: data.durationMinutes || 0,
          isCollapsed: false,
          unlockRule: data.unlockRule || 'immediate',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          modules: [...state.modules, newModule],
        }));

        return newModule;
      },

      updateModule: (moduleUuid, data) => {
        set((state) => ({
          modules: state.modules.map((m) =>
            m.uuid === moduleUuid
              ? { ...m, ...data, updatedAt: new Date().toISOString() }
              : m
          ),
        }));
      },

      deleteModule: (moduleUuid) => {
        const targetMod = get().modules.find((m) => m.uuid === moduleUuid);
        if (!targetMod) return;

        const courseUuid = targetMod.courseUuid;

        set((state) => {
          const remainingModules = state.modules
            .filter((m) => m.uuid !== moduleUuid)
            .map((m) => {
              if (m.courseUuid === courseUuid && m.sortOrder > targetMod.sortOrder) {
                return { ...m, sortOrder: m.sortOrder - 1 };
              }
              return m;
            });

          const remainingLessons = state.lessons.filter((l) => l.moduleUuid !== moduleUuid);

          return {
            modules: remainingModules,
            lessons: remainingLessons,
          };
        });
      },

      duplicateModule: (moduleUuid) => {
        const targetMod = get().modules.find((m) => m.uuid === moduleUuid);
        if (!targetMod) return null;

        const newModUuid = generateUuid();
        const courseUuid = targetMod.courseUuid;

        const duplicatedModule: CourseModule = {
          ...targetMod,
          uuid: newModUuid,
          title: `${targetMod.title} Copy`,
          status: 'draft',
          sortOrder: targetMod.sortOrder + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const targetLessons = get()
          .lessons.filter((l) => l.moduleUuid === moduleUuid)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const duplicatedLessons: CourseLesson[] = targetLessons.map((l) => ({
          ...l,
          uuid: generateUuid(),
          moduleUuid: newModUuid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        set((state) => {
          const updatedModules = state.modules.map((m) => {
            if (m.courseUuid === courseUuid && m.sortOrder > targetMod.sortOrder) {
              return { ...m, sortOrder: m.sortOrder + 1 };
            }
            return m;
          });

          return {
            modules: [...updatedModules, duplicatedModule],
            lessons: [...state.lessons, ...duplicatedLessons],
          };
        });

        return duplicatedModule;
      },

      reorderModules: (courseUuid, orderedModuleUuids) => {
        set((state) => ({
          modules: state.modules.map((m) => {
            if (m.courseUuid === courseUuid) {
              const newIdx = orderedModuleUuids.indexOf(m.uuid);
              if (newIdx !== -1) {
                return { ...m, sortOrder: newIdx + 1 };
              }
            }
            return m;
          }),
        }));
      },

      getModulesByCourse: (courseUuid) => {
        return get()
          .modules.filter((m) => m.courseUuid === courseUuid)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      // LESSON ACTIONS
      getLessonsByModule: (moduleUuid) => {
        return get()
          .lessons.filter((l) => l.moduleUuid === moduleUuid)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      addLesson: (courseUuid, moduleUuid, data) => {
        const moduleLessons = get()
          .lessons.filter((l) => l.moduleUuid === moduleUuid)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const newLesson: CourseLesson = {
          ...data,
          uuid: generateUuid(),
          courseUuid,
          moduleUuid,
          sortOrder: moduleLessons.length + 1,
          content: data.content || {},
          subsections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          lessons: [...state.lessons, newLesson],
        }));

        return newLesson;
      },

      updateLesson: (lessonUuid, data) => {
        set((state) => ({
          lessons: state.lessons.map((l) =>
            l.uuid === lessonUuid
              ? { ...l, ...data, updatedAt: new Date().toISOString() }
              : l
          ),
        }));
      },

      deleteLesson: (lessonUuid) => {
        const targetLesson = get().lessons.find((l) => l.uuid === lessonUuid);
        if (!targetLesson) return;

        const moduleUuid = targetLesson.moduleUuid;

        set((state) => {
          const remaining = state.lessons
            .filter((l) => l.uuid !== lessonUuid)
            .map((l) => {
              if (l.moduleUuid === moduleUuid && l.sortOrder > targetLesson.sortOrder) {
                return { ...l, sortOrder: l.sortOrder - 1 };
              }
              return l;
            });

          return { lessons: remaining };
        });
      },

      duplicateLesson: (lessonUuid) => {
        const targetLesson = get().lessons.find((l) => l.uuid === lessonUuid);
        if (!targetLesson) return null;

        const moduleUuid = targetLesson.moduleUuid;

        const duplicatedLesson: CourseLesson = {
          ...targetLesson,
          uuid: generateUuid(),
          title: `${targetLesson.title} Copy`,
          status: 'draft',
          sortOrder: targetLesson.sortOrder + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedLessons = state.lessons.map((l) => {
            if (l.moduleUuid === moduleUuid && l.sortOrder > targetLesson.sortOrder) {
              return { ...l, sortOrder: l.sortOrder + 1 };
            }
            return l;
          });

          return {
            lessons: [...updatedLessons, duplicatedLesson],
          };
        });

        return duplicatedLesson;
      },

      moveLesson: (lessonUuid, targetModuleUuid, targetIndex) => {
        const targetLesson = get().lessons.find((l) => l.uuid === lessonUuid);
        if (!targetLesson) return;

        const sourceModuleUuid = targetLesson.moduleUuid;

        set((state) => {
          const targetModuleLessons = state.lessons
            .filter((l) => l.moduleUuid === targetModuleUuid && l.uuid !== lessonUuid)
            .sort((a, b) => a.sortOrder - b.sortOrder);

          const insertAt =
            targetIndex !== undefined ? targetIndex : targetModuleLessons.length;

          const updatedMovedLesson: CourseLesson = {
            ...targetLesson,
            moduleUuid: targetModuleUuid,
            sortOrder: insertAt + 1,
            updatedAt: new Date().toISOString(),
          };

          const remainingSourceLessons = state.lessons
            .filter((l) => l.moduleUuid === sourceModuleUuid && l.uuid !== lessonUuid)
            .map((l, idx) => ({ ...l, sortOrder: idx + 1 }));

          targetModuleLessons.splice(insertAt, 0, updatedMovedLesson);
          const reindexedTargetLessons = targetModuleLessons.map((l, idx) => ({
            ...l,
            sortOrder: idx + 1,
          }));

          const otherLessons = state.lessons.filter(
            (l) => l.moduleUuid !== sourceModuleUuid && l.moduleUuid !== targetModuleUuid
          );

          return {
            lessons: [...otherLessons, ...remainingSourceLessons, ...reindexedTargetLessons],
          };
        });
      },

      reorderLessons: (moduleUuid, orderedLessonUuids) => {
        set((state) => ({
          lessons: state.lessons.map((l) => {
            if (l.moduleUuid === moduleUuid) {
              const newIdx = orderedLessonUuids.indexOf(l.uuid);
              if (newIdx !== -1) {
                return { ...l, sortOrder: newIdx + 1 };
              }
            }
            return l;
          }),
        }));
      },

      // SUBSECTION ACTIONS
      addSubsection: (lessonUuid, data) => {
        const lesson = get().lessons.find((l) => l.uuid === lessonUuid);
        const existingSubsections = lesson?.subsections || [];

        const newSubsection: CourseLessonSubsection = {
          ...data,
          uuid: generateUuid(),
          lessonUuid,
          sortOrder: existingSubsections.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          lessons: state.lessons.map((l) =>
            l.uuid === lessonUuid
              ? { ...l, subsections: [...(l.subsections || []), newSubsection] }
              : l
          ),
        }));

        return newSubsection;
      },

      updateSubsection: (lessonUuid, subsectionUuid, data) => {
        set((state) => ({
          lessons: state.lessons.map((l) => {
            if (l.uuid === lessonUuid) {
              const updatedSubsections = (l.subsections || []).map((sub) =>
                sub.uuid === subsectionUuid
                  ? { ...sub, ...data, updatedAt: new Date().toISOString() }
                  : sub
              );
              return { ...l, subsections: updatedSubsections };
            }
            return l;
          }),
        }));
      },

      deleteSubsection: (lessonUuid, subsectionUuid) => {
        set((state) => ({
          lessons: state.lessons.map((l) => {
            if (l.uuid === lessonUuid) {
              const remaining = (l.subsections || [])
                .filter((sub) => sub.uuid !== subsectionUuid)
                .map((sub, idx) => ({ ...sub, sortOrder: idx + 1 }));
              return { ...l, subsections: remaining };
            }
            return l;
          }),
        }));
      },

      duplicateSubsection: (lessonUuid, subsectionUuid) => {
        const lesson = get().lessons.find((l) => l.uuid === lessonUuid);
        if (!lesson) return null;

        const targetSub = (lesson.subsections || []).find((sub) => sub.uuid === subsectionUuid);
        if (!targetSub) return null;

        const duplicatedSub: CourseLessonSubsection = {
          ...targetSub,
          uuid: generateUuid(),
          title: `${targetSub.title} Copy`,
          status: 'draft',
          sortOrder: targetSub.sortOrder + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          lessons: state.lessons.map((l) => {
            if (l.uuid === lessonUuid) {
              const subs = (l.subsections || []).map((sub) => {
                if (sub.sortOrder > targetSub.sortOrder) {
                  return { ...sub, sortOrder: sub.sortOrder + 1 };
                }
                return sub;
              });
              return { ...l, subsections: [...subs, duplicatedSub] };
            }
            return l;
          }),
        }));

        return duplicatedSub;
      },

      reorderSubsections: (lessonUuid, orderedSubsectionUuids) => {
        set((state) => ({
          lessons: state.lessons.map((l) => {
            if (l.uuid === lessonUuid) {
              const reordered = (l.subsections || []).map((sub) => {
                const newIdx = orderedSubsectionUuids.indexOf(sub.uuid);
                if (newIdx !== -1) {
                  return { ...sub, sortOrder: newIdx + 1 };
                }
                return sub;
              });
              return { ...l, subsections: reordered.sort((a, b) => a.sortOrder - b.sortOrder) };
            }
            return l;
          }),
        }));
      },
    }),
    {
      name: 'cubixskill-curriculum-store',
    }
  )
);

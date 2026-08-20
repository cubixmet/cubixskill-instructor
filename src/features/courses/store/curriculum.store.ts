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
  addModuleObject: (moduleObj: CourseModule) => void;
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
  attachResourceToLesson: (lessonUuid: string, resource: import('../../../types/curriculum.types').LessonResourceAttachment) => boolean;
  detachResourceFromLesson: (lessonUuid: string, resourceId: string) => void;

  // Subsection Actions
  addSubsection: (lessonUuid: string, data: CreateSubsectionInput) => CourseLessonSubsection;
  updateSubsection: (lessonUuid: string, subsectionUuid: string, data: UpdateSubsectionInput) => void;
  deleteSubsection: (lessonUuid: string, subsectionUuid: string) => void;
  duplicateSubsection: (lessonUuid: string, subsectionUuid: string) => CourseLessonSubsection | null;
  reorderSubsections: (lessonUuid: string, orderedSubsectionUuids: string[]) => void;

  // Bulk setters for backend sync
  setModules: (modules: CourseModule[]) => void;
  setLessons: (lessons: CourseLesson[]) => void;

  // Helper calculations
  getCalculatedModuleDuration: (moduleUuid: string) => number;
  getCalculatedCourseDuration: (courseUuid: string) => number;
}

const updateModuleDurations = (modules: CourseModule[], lessons: CourseLesson[]): CourseModule[] => {
  return modules.map((mod) => {
    const modLessons = lessons.filter((l) => l.moduleUuid === mod.uuid);
    const totalMins = modLessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    return { ...mod, durationMinutes: totalMins };
  });
};

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set, get) => ({
      modules: [],
      lessons: [],

      setModules: (modules) => set({ modules }),
      setLessons: (lessons) => set({ lessons }),

      // MODULE ACTIONS
      getModulesByCourse: (courseUuid) => {
        const stateModules = get().modules;
        const stateLessons = get().lessons;
        const filteredMods = stateModules.filter((m) => m.courseUuid === courseUuid);
        return updateModuleDurations(filteredMods, stateLessons).sort((a, b) => a.sortOrder - b.sortOrder);
      },

      addModule: (courseUuid, data) => {
        const courseModules = get()
          .modules.filter((m) => m.courseUuid === courseUuid)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const newModule: CourseModule = {
          ...data,
          uuid: generateUuid(),
          courseUuid,
          title: data.title.trim(),
          description: data.description?.trim() || '',
          sortOrder: courseModules.length + 1,
          durationMinutes: 0,
          status: data.status || 'published',
          isCollapsed: false,
          unlockRule: 'immediate',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          modules: [...state.modules, newModule],
        }));

        return newModule;
      },

      addModuleObject: (moduleObj) => {
        set((state) => ({
          modules: [...state.modules.filter((m) => m.uuid !== moduleObj.uuid), moduleObj],
        }));
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
          status: 'published',
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
            if (m.courseUuid !== courseUuid) return m;
            const newIndex = orderedModuleUuids.indexOf(m.uuid);
            if (newIndex !== -1) {
              return { ...m, sortOrder: newIndex + 1, updatedAt: new Date().toISOString() };
            }
            return m;
          }),
        }));
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
          status: data.status || 'published',
          sortOrder: moduleLessons.length + 1,
          content: data.content || {},
          subsections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => {
          const newLessons = [...state.lessons, newLesson];
          return {
            lessons: newLessons,
            modules: updateModuleDurations(state.modules, newLessons),
          };
        });

        return newLesson;
      },

      updateLesson: (lessonUuid, data) => {
        set((state) => {
          const newLessons = state.lessons.map((l) =>
            l.uuid === lessonUuid
              ? { ...l, ...data, updatedAt: new Date().toISOString() }
              : l
          );
          return {
            lessons: newLessons,
            modules: updateModuleDurations(state.modules, newLessons),
          };
        });
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

          return {
            lessons: remaining,
            modules: updateModuleDurations(state.modules, remaining),
          };
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
          status: 'published',
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

          const newLessons = [...updatedLessons, duplicatedLesson];

          return {
            lessons: newLessons,
            modules: updateModuleDurations(state.modules, newLessons),
          };
        });

        return duplicatedLesson;
      },

      moveLesson: (lessonUuid, targetModuleUuid, targetIndex) => {
        const targetLesson = get().lessons.find((l) => l.uuid === lessonUuid);
        if (!targetLesson) return;

        set((state) => {
          const oldModuleUuid = targetLesson.moduleUuid;
          const targetModuleLessons = state.lessons
            .filter((l) => l.moduleUuid === targetModuleUuid && l.uuid !== lessonUuid)
            .sort((a, b) => a.sortOrder - b.sortOrder);

          const insertIndex =
            typeof targetIndex === 'number'
              ? Math.max(0, Math.min(targetIndex, targetModuleLessons.length))
              : targetModuleLessons.length;

          targetModuleLessons.splice(insertIndex, 0, {
            ...targetLesson,
            moduleUuid: targetModuleUuid,
            updatedAt: new Date().toISOString(),
          });

          const updatedTargetLessons = targetModuleLessons.map((l, idx) => ({
            ...l,
            sortOrder: idx + 1,
          }));

          const otherLessons = state.lessons.filter(
            (l) => l.moduleUuid !== oldModuleUuid && l.moduleUuid !== targetModuleUuid
          );

          const remainingOldLessons = state.lessons
            .filter((l) => l.moduleUuid === oldModuleUuid && l.uuid !== lessonUuid)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((l, idx) => ({ ...l, sortOrder: idx + 1 }));

          const newLessons = [...otherLessons, ...remainingOldLessons, ...updatedTargetLessons];

          return {
            lessons: newLessons,
            modules: updateModuleDurations(state.modules, newLessons),
          };
        });
      },

      reorderLessons: (moduleUuid, orderedLessonUuids) => {
        set((state) => ({
          lessons: state.lessons.map((l) => {
            if (l.moduleUuid !== moduleUuid) return l;
            const newIndex = orderedLessonUuids.indexOf(l.uuid);
            if (newIndex !== -1) {
              return { ...l, sortOrder: newIndex + 1, updatedAt: new Date().toISOString() };
            }
            return l;
          }),
        }));
      },

      attachResourceToLesson: (lessonUuid, resource) => {
        let attached = false;
        set((state) => ({
          lessons: state.lessons.map((lesson) => {
            if (lesson.uuid !== lessonUuid) return lesson;
            const currentResources = lesson.content?.resources || [];
            const isDuplicate = currentResources.some(
              (r) =>
                r.url.toLowerCase() === resource.url.toLowerCase() ||
                (resource.mediaAssetId && r.mediaAssetId === resource.mediaAssetId)
            );
            if (isDuplicate) return lesson;
            attached = true;
            return {
              ...lesson,
              content: {
                ...lesson.content,
                resources: [...currentResources, resource],
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        return attached;
      },

      detachResourceFromLesson: (lessonUuid, resourceId) => {
        set((state) => ({
          lessons: state.lessons.map((lesson) => {
            if (lesson.uuid !== lessonUuid) return lesson;
            const currentResources = lesson.content?.resources || [];
            return {
              ...lesson,
              content: {
                ...lesson.content,
                resources: currentResources.filter((r) => r.id !== resourceId),
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // SUBSECTION ACTIONS
      addSubsection: (lessonUuid, data) => {
        const lesson = get().lessons.find((l) => l.uuid === lessonUuid);
        if (!lesson) throw new Error('Lesson not found');

        const currentSubsections = lesson.subsections || [];
        const newSubsection: CourseLessonSubsection = {
          ...data,
          uuid: generateUuid(),
          lessonUuid,
          sortOrder: currentSubsections.length + 1,
          content: data.content || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          lessons: state.lessons.map((l) =>
            l.uuid === lessonUuid
              ? {
                  ...l,
                  subsections: [...(l.subsections || []), newSubsection],
                  updatedAt: new Date().toISOString(),
                }
              : l
          ),
        }));

        return newSubsection;
      },

      updateSubsection: (lessonUuid, subsectionUuid, data) => {
        set((state) => ({
          lessons: state.lessons.map((l) => {
            if (l.uuid !== lessonUuid) return l;
            const updated = (l.subsections || []).map((sub) =>
              sub.uuid === subsectionUuid
                ? { ...sub, ...data, updatedAt: new Date().toISOString() }
                : sub
            );
            return { ...l, subsections: updated, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      deleteSubsection: (lessonUuid, subsectionUuid) => {
        set((state) => ({
          lessons: state.lessons.map((l) => {
            if (l.uuid !== lessonUuid) return l;
            const targetSub = (l.subsections || []).find((s) => s.uuid === subsectionUuid);
            if (!targetSub) return l;

            const remaining = (l.subsections || [])
              .filter((s) => s.uuid !== subsectionUuid)
              .map((s) => {
                if (s.sortOrder > targetSub.sortOrder) {
                  return { ...s, sortOrder: s.sortOrder - 1 };
                }
                return s;
              });

            return { ...l, subsections: remaining, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      duplicateSubsection: (lessonUuid, subsectionUuid) => {
        const lesson = get().lessons.find((l) => l.uuid === lessonUuid);
        if (!lesson) return null;

        const targetSub = (lesson.subsections || []).find((s) => s.uuid === subsectionUuid);
        if (!targetSub) return null;

        const duplicated: CourseLessonSubsection = {
          ...targetSub,
          uuid: generateUuid(),
          title: `${targetSub.title} Copy`,
          sortOrder: targetSub.sortOrder + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          lessons: state.lessons.map((l) => {
            if (l.uuid !== lessonUuid) return l;
            const updated = (l.subsections || []).map((s) => {
              if (s.sortOrder > targetSub.sortOrder) {
                return { ...s, sortOrder: s.sortOrder + 1 };
              }
              return s;
            });
            return {
              ...l,
              subsections: [...updated, duplicated],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));

        return duplicated;
      },

      reorderSubsections: (lessonUuid, orderedSubsectionUuids) => {
        set((state) => ({
          lessons: state.lessons.map((l) => {
            if (l.uuid !== lessonUuid) return l;
            const updated = (l.subsections || []).map((sub) => {
              const newIdx = orderedSubsectionUuids.indexOf(sub.uuid);
              if (newIdx !== -1) {
                return { ...sub, sortOrder: newIdx + 1, updatedAt: new Date().toISOString() };
              }
              return sub;
            });
            return { ...l, subsections: updated, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      // Helper Calculations
      getCalculatedModuleDuration: (moduleUuid) => {
        const modLessons = get().lessons.filter((l) => l.moduleUuid === moduleUuid);
        return modLessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
      },

      getCalculatedCourseDuration: (courseUuid) => {
        const courseLessons = get().lessons.filter((l) => l.courseUuid === courseUuid);
        return courseLessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
      },
    }),
    {
      name: 'cubixskill-curriculum-store-v2',
    }
  )
);

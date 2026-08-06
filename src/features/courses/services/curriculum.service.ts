import { useCurriculumStore } from '../store/curriculum.store';
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

export const curriculumService = {
  // Module Services
  getModulesByCourse: (courseUuid: string): CourseModule[] => {
    return useCurriculumStore.getState().getModulesByCourse(courseUuid);
  },

  createModule: (courseUuid: string, data: CreateModuleInput): CourseModule => {
    return useCurriculumStore.getState().addModule(courseUuid, data);
  },

  updateModule: (moduleUuid: string, data: UpdateModuleInput): void => {
    const targetModule = useCurriculumStore
      .getState()
      .modules.find((m) => m.uuid === moduleUuid);

    if (targetModule) {
      useCurriculumStore.getState().updateModule(moduleUuid, data);
    }
  },

  deleteModule: (moduleUuid: string): void => {
    useCurriculumStore.getState().deleteModule(moduleUuid);
  },

  duplicateModule: (moduleUuid: string): CourseModule | null => {
    return useCurriculumStore.getState().duplicateModule(moduleUuid);
  },

  reorderModules: (courseUuid: string, orderedModuleUuids: string[]): void => {
    useCurriculumStore.getState().reorderModules(courseUuid, orderedModuleUuids);
  },

  // Lesson Services
  getLessonsByModule: (moduleUuid: string): CourseLesson[] => {
    return useCurriculumStore.getState().getLessonsByModule(moduleUuid);
  },

  createLesson: (
    courseUuid: string,
    moduleUuid: string,
    data: CreateLessonInput
  ): CourseLesson => {
    return useCurriculumStore.getState().addLesson(courseUuid, moduleUuid, data);
  },

  updateLesson: (lessonUuid: string, data: UpdateLessonInput): void => {
    useCurriculumStore.getState().updateLesson(lessonUuid, data);
  },

  deleteLesson: (lessonUuid: string): void => {
    useCurriculumStore.getState().deleteLesson(lessonUuid);
  },

  duplicateLesson: (lessonUuid: string): CourseLesson | null => {
    return useCurriculumStore.getState().duplicateLesson(lessonUuid);
  },

  moveLesson: (
    lessonUuid: string,
    targetModuleUuid: string,
    targetIndex?: number
  ): void => {
    useCurriculumStore.getState().moveLesson(lessonUuid, targetModuleUuid, targetIndex);
  },

  reorderLessons: (moduleUuid: string, orderedLessonUuids: string[]): void => {
    useCurriculumStore.getState().reorderLessons(moduleUuid, orderedLessonUuids);
  },

  // Subsection Services
  addSubsection: (lessonUuid: string, data: CreateSubsectionInput): CourseLessonSubsection => {
    return useCurriculumStore.getState().addSubsection(lessonUuid, data);
  },

  updateSubsection: (lessonUuid: string, subsectionUuid: string, data: UpdateSubsectionInput): void => {
    useCurriculumStore.getState().updateSubsection(lessonUuid, subsectionUuid, data);
  },

  deleteSubsection: (lessonUuid: string, subsectionUuid: string): void => {
    useCurriculumStore.getState().deleteSubsection(lessonUuid, subsectionUuid);
  },

  duplicateSubsection: (lessonUuid: string, subsectionUuid: string): CourseLessonSubsection | null => {
    return useCurriculumStore.getState().duplicateSubsection(lessonUuid, subsectionUuid);
  },

  reorderSubsections: (lessonUuid: string, orderedSubsectionUuids: string[]): void => {
    useCurriculumStore.getState().reorderSubsections(lessonUuid, orderedSubsectionUuids);
  },

  // Assignment Attachment Services
  attachAssignmentToLesson: (lessonUuid: string, assignmentUuid: string): void => {
    useCurriculumStore.getState().updateLesson(lessonUuid, {
      content: {
        type: 'assignment',
        assignmentUuid,
      },
    });
  },

  changeLessonAssignment: (lessonUuid: string, assignmentUuid: string): void => {
    useCurriculumStore.getState().updateLesson(lessonUuid, {
      content: {
        type: 'assignment',
        assignmentUuid,
      },
    });
  },

  detachAssignmentFromLesson: (lessonUuid: string): void => {
    useCurriculumStore.getState().updateLesson(lessonUuid, {
      content: undefined,
    });
  },
};

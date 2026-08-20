import { apiClient } from '../../../api/client';
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
  LessonContent,
  UpdateSubsectionInput,
  LessonResourceAttachment,
} from '../../../types/curriculum.types';
import { resourceService } from './resource.service';

export const curriculumService = {
  // 1. Module APIs
  async fetchModules(courseUuid: string): Promise<CourseModule[]> {
    if (!courseUuid) return [];

    console.log(`[curriculumService] Fetching modules for course: ${courseUuid}`);
    const response = await apiClient.get<
      { data?: Record<string, unknown>[] | { results?: Record<string, unknown>[] } } | Record<string, unknown>[]
    >(`/api/v1/modules/courses/${courseUuid}/modules/`);

    console.log(`[curriculumService] HTTP ${response.status} response for course ${courseUuid}`);

    let rawData: Record<string, unknown>[] = [];
    const resData = response.data as any;

    if (Array.isArray(resData)) {
      rawData = resData;
    } else if (resData && Array.isArray(resData.data)) {
      rawData = resData.data;
    } else if (resData && resData.data && Array.isArray(resData.data.results)) {
      rawData = resData.data.results;
    } else if (resData && Array.isArray(resData.results)) {
      rawData = resData.results;
    }

    const modulesList: CourseModule[] = rawData.map((m: Record<string, unknown>, idx: number) => ({
      uuid: String(m.id || m.uuid || ''),
      courseUuid: String(m.course || m.course_id || courseUuid),
      title: String(m.title || ''),
      description: String(m.description || ''),
      status: m.is_active === false ? 'draft' : 'published',
      sortOrder: typeof m.order_index === 'number' ? m.order_index : idx + 1,
      durationMinutes: typeof m.duration_minutes === 'number' ? m.duration_minutes : 0,
      isCollapsed: false,
      unlockRule: 'immediate',
      createdAt: String(m.created_at || new Date().toISOString()),
      updatedAt: String(m.updated_at || new Date().toISOString()),
    })).filter((m) => Boolean(m.uuid));

    modulesList.sort((a, b) => a.sortOrder - b.sortOrder);

    console.log(`[curriculumService] Parsed ${modulesList.length} modules for course ${courseUuid}`);
    if (modulesList.length > 0) {
      console.log(`[curriculumService] First module: ID=${modulesList[0].uuid}, Title="${modulesList[0].title}"`);
    }

    // Single source of truth update
    const currentModules = useCurriculumStore.getState().modules;
    const otherModules = currentModules.filter((m) => m.courseUuid !== courseUuid);
    useCurriculumStore.getState().setModules([...otherModules, ...modulesList]);

    return modulesList;
  },

  async createModule(courseUuid: string, data: CreateModuleInput): Promise<CourseModule> {
    const response = await apiClient.post<{ data?: Record<string, unknown> } | Record<string, unknown>>(
      `/api/v1/modules/courses/${courseUuid}/modules/`,
      {
        title: data.title,
        description: data.description || '',
        is_demo: false,
      }
    );

    const m = (response.data as any)?.data || response.data;
    const createdModule: CourseModule = {
      uuid: (m.id as string) || (m.uuid as string),
      courseUuid: (m.course as string) || courseUuid,
      title: (m.title as string) || data.title,
      description: (m.description as string) || data.description || '',
      status: m.is_active === false ? 'draft' : 'published',
      sortOrder: (m.order_index as number) ?? 1,
      durationMinutes: (m.duration_minutes as number) || 0,
      isCollapsed: false,
      unlockRule: 'immediate',
      createdAt: (m.created_at as string) || new Date().toISOString(),
      updatedAt: (m.updated_at as string) || new Date().toISOString(),
    };

    useCurriculumStore.getState().addModuleObject(createdModule);
    return createdModule;
  },

  async updateModule(moduleUuid: string, courseUuid: string, data: UpdateModuleInput): Promise<void> {
    useCurriculumStore.getState().updateModule(moduleUuid, data);
    await apiClient.patch(`/api/v1/modules/courses/${courseUuid}/modules/${moduleUuid}/`, {
      title: data.title,
      description: data.description,
    });
  },

  async deleteModule(moduleUuid: string, courseUuid: string): Promise<void> {
    useCurriculumStore.getState().deleteModule(moduleUuid);
    await apiClient.delete(`/api/v1/modules/courses/${courseUuid}/modules/${moduleUuid}/`);
  },

  duplicateModule: (moduleUuid: string): CourseModule | null => {
    return useCurriculumStore.getState().duplicateModule(moduleUuid);
  },

  async reorderModules(courseUuid: string, orderedModuleUuids: string[]): Promise<void> {
    useCurriculumStore.getState().reorderModules(courseUuid, orderedModuleUuids);
    await apiClient.post(`/api/v1/modules/courses/${courseUuid}/modules/reorder/`, {
      modules: orderedModuleUuids,
    });
  },

  getModulesByCourse: (courseUuid: string): CourseModule[] => {
    return useCurriculumStore.getState().getModulesByCourse(courseUuid);
  },

  // 2. Lesson APIs
  getLessonsByModule: (moduleUuid: string): CourseLesson[] => {
    return useCurriculumStore.getState().getLessonsByModule(moduleUuid);
  },

  async createLesson(
    courseUuid: string,
    moduleUuid: string,
    data: CreateLessonInput
  ): Promise<CourseLesson> {
    const response = await apiClient.post<{ data: Record<string, unknown> } | Record<string, unknown>>(
      `/api/v1/lessons/modules/${moduleUuid}/lessons/`,
      {
        title: data.title,
        lesson_type: data.type.toUpperCase(),
        description: data.description || '',
        duration_minutes: data.durationMinutes || 0,
        is_demo: data.isDemo || false,
        allow_download: data.allowDownload || false,
      }
    );
    const backendData = (response.data as { data?: Record<string, unknown> })?.data || (response.data as Record<string, unknown>);
    const realId = String(backendData.id || backendData.uuid || '');

    if (!realId) {
      throw new Error('Lesson creation succeeded on backend, but no valid lesson ID was returned.');
    }

    const created = useCurriculumStore.getState().addLesson(courseUuid, moduleUuid, {
      ...data,
      id: realId,
    } as any);

    if (created && created.uuid !== realId) {
      created.uuid = realId;
      useCurriculumStore.getState().updateLesson(created.uuid, { id: realId } as any);
    }
    return created;
  },

  updateLesson: (lessonUuid: string, data: UpdateLessonInput): void => {
    useCurriculumStore.getState().updateLesson(lessonUuid, data);
    apiClient
      .patch(`/api/v1/lessons/${lessonUuid}/`, {
        title: data.title,
        description: data.description,
        duration_minutes: data.durationMinutes,
        is_demo: data.isDemo,
        allow_download: data.allowDownload,
      })
      .catch((err) => console.warn('Failed to sync updated lesson with backend API:', err));
  },

  deleteLesson: (lessonUuid: string): void => {
    useCurriculumStore.getState().deleteLesson(lessonUuid);
    apiClient
      .delete(`/api/v1/lessons/${lessonUuid}/`)
      .catch((err) => console.warn('Failed to sync deleted lesson with backend API:', err));
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
    apiClient
      .post(`/api/v1/lessons/modules/${moduleUuid}/lessons/reorder/`, {
        lessons: orderedLessonUuids,
      })
      .catch((err) => console.warn('Failed to sync reordered lessons with backend API:', err));
  },

  // 3. Subsection Services
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

  // 4. Assignment & Resource Attachments
  attachAssignmentToLesson: (lessonUuid: string, assignmentUuid: string): void => {
    useCurriculumStore.getState().updateLesson(lessonUuid, {
      content: {
        assignmentUuid,
      } as LessonContent,
    });
  },

  changeLessonAssignment: (lessonUuid: string, assignmentUuid: string): void => {
    useCurriculumStore.getState().updateLesson(lessonUuid, {
      content: {
        assignmentUuid,
      } as LessonContent,
    });
  },

  detachAssignmentFromLesson: (lessonUuid: string): void => {
    useCurriculumStore.getState().updateLesson(lessonUuid, {
      content: undefined,
    });
  },

  // 5. Lesson Resource APIs
  async createLessonResource(lessonUuid: string, payload: {
    title: string;
    url?: string;
    description?: string;
    resource_type?: string;
    allow_download?: boolean;
    media_file_id?: string;
  }): Promise<LessonResourceAttachment> {
    return resourceService.create(lessonUuid, payload);
  },

  async deleteLessonResource(lessonUuid: string, resourceId: string): Promise<void> {
    return resourceService.delete(lessonUuid, resourceId);
  },
};

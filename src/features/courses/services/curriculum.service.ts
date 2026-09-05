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
import { toBackendLessonType } from '../config/lessonTypes.config';

import { isValidCourseId, isValidModuleUuid } from '../../../utils/courseValidation.utils';

export const curriculumService = {
  // 1. Module APIs
  async fetchModules(courseUuid: string): Promise<CourseModule[]> {
    if (!isValidCourseId(courseUuid)) {
      console.warn(`[curriculumService] Rejecting fetchModules due to invalid courseUuid: ${courseUuid}`);
      return [];
    }

    const response = await apiClient.get<
      { data?: Record<string, unknown>[] | { results?: Record<string, unknown>[] } } | Record<string, unknown>[]
    >(`/api/v1/modules/courses/${courseUuid}/modules/`);

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

    const modulesList: CourseModule[] = [];
    const allFetchedLessons: CourseLesson[] = [];

    rawData.forEach((m: Record<string, unknown>, idx: number) => {
      const moduleUuid = String(m.id || m.uuid || '');
      if (!moduleUuid) return;

      modulesList.push({
        uuid: moduleUuid,
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
      });

      if (Array.isArray(m.lessons)) {
        (m.lessons as Record<string, any>[]).forEach((l: Record<string, any>, lIdx: number) => {
          const lessonUuid = String(l.id || l.uuid || '');
          if (!lessonUuid) return;

          const rawExternalUrl = String(l.external_url || l.externalUrl || '');
          const rawVideoUrl = String(l.video_url || l.videoUrl || '');
          const rawAudioUrl = String(l.audio_url || l.audioUrl || '');
          const primaryMedia = l.primary_media || null;
          const rawStreamUrl = String(l.stream_url || primaryMedia?.stream_url || '');
          const mediaFiles = l.media_files || [];
          const mediaFileUrl = primaryMedia?.url || primaryMedia?.file || mediaFiles[0]?.media_file?.url || '';

          const rawQCount = typeof l.question_count === 'number' ? l.question_count : (l.quiz?.question_count || l.quiz?.questions?.length || 0);

          allFetchedLessons.push({
            uuid: lessonUuid,
            courseUuid,
            moduleUuid,
            title: String(l.title || ''),
            description: String(l.description || ''),
            type: String(l.lesson_type || l.type || 'video').toLowerCase() as any,
            status: l.is_active === false ? 'draft' : 'published',
            sortOrder: typeof l.order_index === 'number' ? l.order_index : lIdx + 1,
            durationMinutes: typeof l.duration_minutes === 'number' ? l.duration_minutes : 0,
            isDemo: Boolean(l.is_demo),
            is_locked: Boolean(l.is_locked),
            isLocked: Boolean(l.is_locked),
            allowDownload: Boolean(l.allow_download),
            external_url: rawExternalUrl,
            video_url: rawVideoUrl,
            audio_url: rawAudioUrl,
            stream_url: rawStreamUrl,
            primary_media: primaryMedia,
            media_files: mediaFiles,
            question_count: rawQCount,
            content: {
              externalUrl: rawExternalUrl || rawAudioUrl || rawVideoUrl,
              audioUrl: rawAudioUrl || rawExternalUrl || mediaFileUrl,
              videoUrl: rawVideoUrl || rawExternalUrl || mediaFileUrl,
              streamUrl: rawStreamUrl,
              mediaUrl: mediaFileUrl || rawExternalUrl || rawAudioUrl || rawVideoUrl,
              mediaFile: primaryMedia,
              mediaFileId: primaryMedia?.id || null,
              resources: l.resources || [],
              questions: l.quiz?.questions || [],
            },
            subsections: [],
            createdAt: String(l.created_at || new Date().toISOString()),
            updatedAt: String(l.updated_at || new Date().toISOString()),
          });
        });
      }
    });

    modulesList.sort((a, b) => a.sortOrder - b.sortOrder);

    // Single source of truth update
    const currentModules = useCurriculumStore.getState().modules;
    const otherModules = currentModules.filter((m) => m.courseUuid !== courseUuid);
    useCurriculumStore.getState().setModules([...otherModules, ...modulesList]);

    if (allFetchedLessons.length > 0) {
      const currentLessons = useCurriculumStore.getState().lessons;
      const fetchedLessonUuids = new Set(allFetchedLessons.map((l) => l.uuid));
      const otherLessons = currentLessons.filter((l) => !fetchedLessonUuids.has(l.uuid));
      useCurriculumStore.getState().setLessons([...otherLessons, ...allFetchedLessons]);
    }

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
    try {
      await apiClient.delete(`/api/v1/modules/courses/${courseUuid}/modules/${moduleUuid}/`);
      useCurriculumStore.getState().deleteModule(moduleUuid);
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      if (status === 404) {
        console.warn(`[curriculumService] Module ${moduleUuid} returned 404 on delete. Reconciling store state.`);
        useCurriculumStore.getState().deleteModule(moduleUuid);
        return;
      }
      throw err;
    }
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
    if (!isValidCourseId(courseUuid) || !isValidModuleUuid(moduleUuid)) {
      throw new Error(`Invalid courseId (${courseUuid}) or moduleUuid (${moduleUuid})`);
    }

    const content = (data as any)?.content || {};
    const mediaFileId = content.mediaFileId || content.mediaFile?.id || (data as any)?.media_file_id || (data as any)?.media_id || null;
    const sourceMode = String(content.sourceMode || (data as any)?.content_source || (mediaFileId ? 'UPLOAD' : 'URL')).toUpperCase();

    let externalUrl = '';
    if (sourceMode === 'URL' || !mediaFileId) {
      externalUrl = content.externalUrl || content.mediaUrl || (data as any)?.external_url || '';
    }

    const backendLessonType = toBackendLessonType(data.type);
    const textContent = content.textContent || content.body || '';

    const rawIsLocked = (data as any)?.is_locked ?? data.isLocked;
    const payload: Record<string, any> = {
      title: data.title,
      lesson_type: backendLessonType,
      content_source: sourceMode.toLowerCase(),
      description: data.description || '',
      duration_minutes: data.durationMinutes || 0,
      is_demo: typeof data.isDemo === 'boolean' ? data.isDemo : Boolean(data.isDemo),
      is_locked: typeof rawIsLocked === 'boolean' ? rawIsLocked : Boolean(rawIsLocked),
      allow_download: Boolean(data.allowDownload),
    };

    if (externalUrl) {
      payload.external_url = externalUrl;
    }
    if (textContent) {
      payload.content = textContent;
    }
    if (backendLessonType === 'QUIZ' || data.type === 'quiz') {
      payload.content = content.quizPayload || content.quiz || content;
    }
    if (backendLessonType === 'ASSIGNMENT' || backendLessonType === 'PROJECT' || data.type === 'assignment' || data.type === 'project') {
      payload.content = content.assignmentPayload || content.assignment || content;
    }
    if (mediaFileId) {
      payload.media_file_id = mediaFileId;
    }

    const rawResources = Array.isArray(content.resources)
      ? content.resources
      : Array.isArray((data as any).resources)
      ? (data as any).resources
      : [];

    if (rawResources.length > 0) {
      payload.resources = rawResources;
    }

    let response: any;
    try {
      response = await apiClient.post<{ data: Record<string, unknown> } | Record<string, unknown>>(
        `/api/v1/lessons/modules/${moduleUuid}/lessons/`,
        payload
      );
    } catch (err: any) {
      const fieldErrors = err?.data?.data?.fields || err?.data?.fields || err?.response?.data?.data?.fields || err?.response?.data?.fields;
      if (fieldErrors) {
        console.error('[lessonService] Create lesson validation failed:', fieldErrors);
      }
      throw err;
    }
    const backendData = (response.data as { data?: Record<string, unknown> })?.data || (response.data as Record<string, unknown>);
    const realId = String(backendData.id || backendData.uuid || '');

    if (!realId) {
      throw new Error('Lesson creation succeeded on backend, but no valid lesson ID was returned.');
    }

    const created = useCurriculumStore.getState().addLesson(courseUuid, moduleUuid, {
      ...data,
      id: realId,
      uuid: realId,
      video_url: backendData.video_url || content.videoUrl,
      stream_url: backendData.stream_url || (backendData.primary_media as any)?.stream_url || '',
      primary_media: backendData.primary_media || null,
      media_files: backendData.media_files || [],
      question_count: backendData.question_count || (backendData.quiz as any)?.questions?.length || 0,
      quiz: backendData.quiz || null,
    } as any);

    if (created && created.uuid !== realId) {
      created.uuid = realId;
      useCurriculumStore.getState().updateLesson(created.uuid, {
        id: realId,
        uuid: realId,
        video_url: backendData.video_url || content.videoUrl,
        stream_url: backendData.stream_url || (backendData.primary_media as any)?.stream_url || '',
        primary_media: backendData.primary_media || null,
        media_files: backendData.media_files || [],
        question_count: backendData.question_count || (backendData.quiz as any)?.questions?.length || 0,
        quiz: backendData.quiz || null,
      } as any);
    }
    return created;
  },

  async updateLesson(lessonUuid: string, data: UpdateLessonInput): Promise<void> {
    const content = (data as any)?.content || {};
    const mediaFileId =
      content.mediaFileId ||
      content.mediaFile?.id ||
      (data as any)?.media_file_id ||
      (data as any)?.media_id ||
      null;

    const sourceModeRaw = content.sourceMode || (data as any)?.content_source;
    const sourceMode = sourceModeRaw
      ? String(sourceModeRaw).toUpperCase()
      : (mediaFileId ? 'UPLOAD' : null);

    const payload: Record<string, any> = {};

    if (typeof data.title === 'string') {
      payload.title = data.title;
    }
    if (typeof data.description === 'string') {
      payload.description = data.description;
    }
    if (typeof data.durationMinutes === 'number') {
      payload.duration_minutes = data.durationMinutes;
    }
    if (typeof data.isDemo === 'boolean') {
      payload.is_demo = data.isDemo;
    }

    const rawIsLocked = (data as any)?.is_locked ?? data.isLocked;
    if (typeof rawIsLocked === 'boolean') {
      payload.is_locked = rawIsLocked;
    }

    if (typeof data.allowDownload === 'boolean') {
      payload.allow_download = data.allowDownload;
    }

    if (sourceMode === 'UPLOAD') {
      payload.content_source = 'upload';
      if (mediaFileId) {
        payload.media_file_id = mediaFileId;
      }
    } else if (sourceMode === 'URL') {
      payload.content_source = 'url';
      const explicitExternalUrl = String(content.externalUrl || (data as any)?.external_url || '').trim();
      if (explicitExternalUrl) {
        payload.external_url = explicitExternalUrl;
      }
    }

    if (content.quizPayload || content.quiz || (data as any).quizPayload) {
      payload.content = content.quizPayload || content.quiz || (data as any).quizPayload;
    } else if (content.assignmentPayload || content.assignment || (data as any).assignmentPayload) {
      payload.content = content.assignmentPayload || content.assignment || (data as any).assignmentPayload;
    } else {
      const textContent = content.textContent || content.body || '';
      if (textContent) {
        payload.content = textContent;
      }
    }

    let res: any;
    try {
      res = await apiClient.patch(`/api/v1/lessons/${lessonUuid}/`, payload);
    } catch (err: any) {
      const responseErr = err?.response?.data || err?.data;
      console.error('[lesson-update] PATCH failed:', { lessonUuid, payload, responseErr });
      throw err;
    }

    const updatedBackend = res.data?.data || res.data;
    if (updatedBackend) {
      const rawStreamUrl = String(updatedBackend.stream_url || (updatedBackend.primary_media as any)?.stream_url || '');
      const rawVideoUrl = String(updatedBackend.video_url || (updatedBackend.primary_media as any)?.url || '');

      useCurriculumStore.getState().updateLesson(lessonUuid, {
        title: updatedBackend.title,
        description: updatedBackend.description,
        durationMinutes: updatedBackend.duration_minutes ?? 0,
        isDemo: Boolean(updatedBackend.is_demo),
        is_locked: Boolean(updatedBackend.is_locked),
        isLocked: Boolean(updatedBackend.is_locked),
        allowDownload: Boolean(updatedBackend.allow_download),
        video_url: rawVideoUrl,
        stream_url: rawStreamUrl,
        primary_media: updatedBackend.primary_media || null,
        media_files: updatedBackend.media_files || [],
        question_count: updatedBackend.question_count || (updatedBackend.quiz as any)?.questions?.length || 0,
        quiz: updatedBackend.quiz || null,
      } as any);
    }
  },

  async deleteLesson(lessonUuid: string): Promise<void> {
    await apiClient.delete(`/api/v1/lessons/${lessonUuid}/`);
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

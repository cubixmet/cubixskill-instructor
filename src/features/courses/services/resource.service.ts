import { apiClient } from '../../../api/client';
import { useCurriculumStore } from '../store/curriculum.store';
import type { LessonResourceAttachment } from '../../../types/curriculum.types';

export interface CreateResourcePayload {
  title: string;
  url?: string;
  description?: string;
  resource_type?: string;
  allow_download?: boolean;
  media_file_id?: string;
}

export interface UpdateResourcePayload {
  title?: string;
  url?: string;
  description?: string;
  resource_type?: string;
  allow_download?: boolean;
  media_file_id?: string;
}

export const resourceService = {
  /**
   * List resources for a specific lesson
   */
  async list(lessonUuid: string): Promise<LessonResourceAttachment[]> {
    if (!lessonUuid) return [];

    const response = await apiClient.get<
      { data?: Record<string, unknown>[] } | Record<string, unknown>[]
    >(`/api/v1/lessons/resources/?lesson_id=${lessonUuid}`);

    let rawData: Record<string, unknown>[] = [];
    const resData = response.data as any;

    if (Array.isArray(resData)) {
      rawData = resData;
    } else if (resData && Array.isArray(resData.data)) {
      rawData = resData.data;
    } else if (resData && resData.results && Array.isArray(resData.results)) {
      rawData = resData.results;
    }

    return rawData.map((r: Record<string, unknown>) => {
      const media = r.media_file as Record<string, unknown> | undefined;
      return {
        id: String(r.id || ''),
        name: String(r.title || ''),
        type: (r.resource_type as any) || 'link',
        url: String(r.url || media?.file_url || media?.url || ''),
        provider: media ? 'Uploaded File' : 'Resource Link',
        allowDownload: Boolean(r.allow_download),
        attachedAt: String(r.created_at || new Date().toISOString()),
      };
    });
  },

  /**
   * Create a new resource associated with a lesson
   */
  async create(lessonUuid: string, payload: CreateResourcePayload): Promise<LessonResourceAttachment> {
    if (!lessonUuid) {
      throw new Error('A saved lesson is required before adding resources.');
    }

    const body: Record<string, any> = {
      lesson: lessonUuid,
      title: payload.title,
      url: payload.url || '',
      description: payload.description || '',
      resource_type: payload.resource_type || 'link',
      allow_download: payload.allow_download || false,
    };
    if (payload.media_file_id) {
      body.media_file_id = payload.media_file_id;
    }

    const response = await apiClient.post<{ data: Record<string, unknown> } | Record<string, unknown>>(
      `/api/v1/lessons/resources/`,
      body
    );

    const data = (response.data as { data?: Record<string, unknown> })?.data || (response.data as Record<string, unknown>);
    const resId = (data.id as string) || `res-${Date.now()}`;
    const media = data.media_file as Record<string, unknown> | undefined;

    const attachment: LessonResourceAttachment = {
      id: resId,
      name: (data.title as string) || payload.title,
      type: (data.resource_type as any) || payload.resource_type || 'link',
      url: (data.url as string) || (media?.file_url as string) || (media?.url as string) || payload.url || '',
      provider: media ? 'Uploaded File' : 'Resource Link',
      allowDownload: Boolean(data.allow_download ?? payload.allow_download),
      attachedAt: (data.created_at as string) || new Date().toISOString(),
    };

    useCurriculumStore.getState().attachResourceToLesson(lessonUuid, attachment);
    return attachment;
  },

  /**
   * Update an existing resource
   */
  async update(resourceId: string, payload: UpdateResourcePayload): Promise<Record<string, unknown>> {
    const response = await apiClient.patch<{ data: Record<string, unknown> } | Record<string, unknown>>(
      `/api/v1/lessons/resources/${resourceId}/`,
      payload
    );
    return (response.data as { data?: Record<string, unknown> })?.data || (response.data as Record<string, unknown>);
  },

  /**
   * Delete a resource
   */
  async delete(lessonUuid: string, resourceId: string): Promise<void> {
    useCurriculumStore.getState().detachResourceFromLesson(lessonUuid, resourceId);
    await apiClient.delete(`/api/v1/lessons/resources/${resourceId}/`);
  },
};

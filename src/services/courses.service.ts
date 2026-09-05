import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import { categoryService } from "./category.service";
import { normalizeCourseId } from "../utils/courseValidation.utils";
import type { BackendApiResponse, PaginatedResponse } from "../api/types";
import type {
  CourseListItem,
  CourseDetail,
  CreateCoursePayload,
  UpdateCoursePayload,
  CourseCategory,
  CourseModule,
  MediaFile,
  CoursePublishReadiness,
} from "../features/courses/types/course.types";

import { resolveMediaUrl } from "../utils/media.utils";

function normalizeCourseMedia<T extends Record<string, any>>(course: T): T {
  if (!course) return course;
  const copy = { ...course };

  if (copy.thumbnail) {
    if (typeof copy.thumbnail === 'object') {
      copy.thumbnail = {
        ...copy.thumbnail,
        url: resolveMediaUrl(copy.thumbnail),
      };
    } else if (typeof copy.thumbnail === 'string') {
      copy.thumbnail_url = resolveMediaUrl(copy.thumbnail);
    }
  }
  if (copy.thumbnail_url) {
    copy.thumbnail_url = resolveMediaUrl(copy.thumbnail_url);
  }
  if (copy.promo_video) {
    if (typeof copy.promo_video === 'object') {
      copy.promo_video = {
        ...copy.promo_video,
        url: resolveMediaUrl(copy.promo_video),
      };
    } else if (typeof copy.promo_video === 'string') {
      copy.promo_video_url = resolveMediaUrl(copy.promo_video);
    }
  }
  if (copy.promo_video_url) {
    copy.promo_video_url = resolveMediaUrl(copy.promo_video_url);
  }
  return copy;
}

export const coursesService = {
  async listCourses(params?: {
    status?: string;
    level?: string;
    category?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<CourseListItem> | CourseListItem[]> {
    const response = await apiClient.get<BackendApiResponse<PaginatedResponse<CourseListItem>> | CourseListItem[]>(
      API_ENDPOINTS.COURSES.LIST,
      { params }
    );
    const data = (response.data as any)?.data || response.data;
    if (Array.isArray(data)) {
      return data.map((item) => normalizeCourseMedia(item));
    }
    if (data && Array.isArray(data.results)) {
      return {
        ...data,
        results: data.results.map((item: any) => normalizeCourseMedia(item)),
      };
    }
    return data;
  },

  async getCourse(id: string): Promise<CourseDetail> {
    const validId = normalizeCourseId(id);
    if (!validId) {
      throw new Error("Invalid course ID provided.");
    }
    const response = await apiClient.get<BackendApiResponse<CourseDetail>>(
      API_ENDPOINTS.COURSES.DETAIL(validId)
    );
    const data = response.data?.data || (response.data as unknown as CourseDetail);
    return normalizeCourseMedia(data);
  },

  async createCourse(payload: CreateCoursePayload): Promise<CourseDetail> {
    const response = await apiClient.post<BackendApiResponse<CourseDetail>>(
      API_ENDPOINTS.COURSES.LIST,
      payload
    );
    const data = response.data?.data || (response.data as unknown as CourseDetail);
    return normalizeCourseMedia(data);
  },

  async updateCourse(id: string, payload: UpdateCoursePayload): Promise<CourseDetail> {
    const validId = normalizeCourseId(id);
    if (!validId) {
      throw new Error("Invalid course ID provided.");
    }
    const response = await apiClient.put<BackendApiResponse<CourseDetail>>(
      API_ENDPOINTS.COURSES.DETAIL(validId),
      payload
    );
    const data = response.data?.data || (response.data as unknown as CourseDetail);
    return normalizeCourseMedia(data);
  },

  async patchCourse(id: string, payload: UpdateCoursePayload): Promise<CourseDetail> {
    const validId = normalizeCourseId(id);
    if (!validId) {
      throw new Error("Invalid course ID provided.");
    }
    const response = await apiClient.patch<BackendApiResponse<CourseDetail>>(
      API_ENDPOINTS.COURSES.DETAIL(validId),
      payload
    );
    const data = response.data?.data || (response.data as unknown as CourseDetail);
    return normalizeCourseMedia(data);
  },

  async deleteCourse(id: string): Promise<void> {
    const validId = normalizeCourseId(id);
    if (!validId) return;
    await apiClient.delete(API_ENDPOINTS.COURSES.DETAIL(validId));
  },

  async publishCourse(id: string): Promise<CourseDetail> {
    const validId = normalizeCourseId(id);
    if (!validId) throw new Error("Invalid course ID provided.");
    const response = await apiClient.post<BackendApiResponse<CourseDetail>>(
      `/api/v1/courses/courses/${validId}/publish/`
    );
    const data = response.data?.data || (response.data as unknown as CourseDetail);
    return normalizeCourseMedia(data);
  },

  async archiveCourse(id: string): Promise<CourseDetail> {
    const validId = normalizeCourseId(id);
    if (!validId) throw new Error("Invalid course ID provided.");
    const response = await apiClient.post<BackendApiResponse<CourseDetail>>(
      `/api/v1/courses/courses/${validId}/archive/`
    );
    const data = response.data?.data || (response.data as unknown as CourseDetail);
    return normalizeCourseMedia(data);
  },

  async duplicateCourse(id: string): Promise<CourseDetail> {
    const validId = normalizeCourseId(id);
    if (!validId) throw new Error("Invalid course ID provided.");
    const response = await apiClient.post<BackendApiResponse<CourseDetail>>(
      `/api/v1/courses/courses/${validId}/duplicate/`
    );
    const data = response.data?.data || (response.data as unknown as CourseDetail);
    return normalizeCourseMedia(data);
  },

  async listCategories(search?: string): Promise<CourseCategory[]> {
    return categoryService.list(search);
  },

  async createCategory(name: string, description?: string, is_active: boolean = true): Promise<CourseCategory> {
    return categoryService.create(name, description, is_active);
  },

  async updateCategory(id: string, name: string, description?: string, is_active?: boolean): Promise<CourseCategory> {
    return categoryService.update(id, name, description, is_active);
  },

  async patchCategory(id: string, payload: Partial<{ name: string; description: string; is_active: boolean }>): Promise<CourseCategory> {
    return categoryService.patch(id, payload);
  },

  async deleteCategory(id: string): Promise<void> {
    return categoryService.delete(id);
  },

  async checkSimilarCategories(name: string): Promise<{
    exact_match: CourseCategory | null;
    alias_match: CourseCategory | null;
    similar_categories: CourseCategory[];
  }> {
    return categoryService.checkSimilar(name);
  },

  async mergeCategories(sourceCategoryId: string, targetCategoryId: string): Promise<{
    message: string;
    target_category: CourseCategory;
  }> {
    return categoryService.merge(sourceCategoryId, targetCategoryId);
  },

  async listMergeAudits(): Promise<any[]> {
    return categoryService.getMergeAudits();
  },


  async listModules(courseId: string): Promise<CourseModule[]> {
    const validId = normalizeCourseId(courseId);
    if (!validId) return [];
    const response = await apiClient.get<BackendApiResponse<CourseModule[]> | CourseModule[]>(
      `/api/v1/courses/course-modules/`,
      { params: { course: validId } }
    );
    const data = (response.data as any)?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  async createModule(courseId: string, title: string, description?: string): Promise<CourseModule> {
    const response = await apiClient.post<BackendApiResponse<CourseModule>>(
      "/api/v1/courses/course-modules/",
      { course: courseId, title, description }
    );
    return response.data?.data || (response.data as unknown as CourseModule);
  },

  async uploadMedia(file: File, courseUuid?: string, lessonUuid?: string, hlsEnabled?: boolean): Promise<MediaFile> {
    const formData = new FormData();
    formData.append("file", file);
    if (courseUuid) {
      formData.append("course_uuid", courseUuid);
    }
    if (lessonUuid) {
      formData.append("lesson_uuid", lessonUuid);
    }
    if (typeof hlsEnabled === 'boolean') {
      formData.append("hls_enabled", hlsEnabled ? "true" : "false");
    }
    const response = await apiClient.post<BackendApiResponse<MediaFile>>(
      "/api/v1/storage/upload/",
      formData
    );
    const data = response.data?.data || (response.data as unknown as MediaFile);
    if (data) {
      if (data.url) data.url = resolveMediaUrl(data.url);
      if (data.relative_path) data.relative_path = resolveMediaUrl(data.relative_path);
    }
    return data;
  },

  async getPublishReadiness(id: string): Promise<CoursePublishReadiness> {
    const validId = normalizeCourseId(id);
    if (!validId) throw new Error("Invalid course ID provided.");
    const response = await apiClient.get<BackendApiResponse<CoursePublishReadiness> | CoursePublishReadiness>(
      `/api/v1/courses/courses/${validId}/publish-readiness/`
    );
    return (response.data as any)?.data || response.data;
  },
};

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
} from "../features/courses/types/course.types";

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
    return response.data?.data || (response.data as unknown as CourseDetail);
  },

  async createCourse(payload: CreateCoursePayload): Promise<CourseDetail> {
    const response = await apiClient.post<BackendApiResponse<CourseDetail>>(
      API_ENDPOINTS.COURSES.LIST,
      payload
    );
    return response.data?.data || (response.data as unknown as CourseDetail);
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
    return response.data?.data || (response.data as unknown as CourseDetail);
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
    return response.data?.data || (response.data as unknown as CourseDetail);
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
    return response.data?.data || (response.data as unknown as CourseDetail);
  },

  async archiveCourse(id: string): Promise<CourseDetail> {
    const validId = normalizeCourseId(id);
    if (!validId) throw new Error("Invalid course ID provided.");
    const response = await apiClient.post<BackendApiResponse<CourseDetail>>(
      `/api/v1/courses/courses/${validId}/archive/`
    );
    return response.data?.data || (response.data as unknown as CourseDetail);
  },

  async duplicateCourse(id: string): Promise<CourseDetail> {
    const validId = normalizeCourseId(id);
    if (!validId) throw new Error("Invalid course ID provided.");
    const response = await apiClient.post<BackendApiResponse<CourseDetail>>(
      `/api/v1/courses/courses/${validId}/duplicate/`
    );
    return response.data?.data || (response.data as unknown as CourseDetail);
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

  async uploadMedia(file: File): Promise<MediaFile> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<BackendApiResponse<MediaFile>>(
      "/api/v1/storage/upload/",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data?.data || (response.data as unknown as MediaFile);
  },
};

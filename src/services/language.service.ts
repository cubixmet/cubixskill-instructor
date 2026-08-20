import { apiClient } from "../api/client";
import type { BackendApiResponse } from "../api/types";

export interface CourseLanguageItem {
  id: string;
  name: string;
  code?: string;
  slug?: string;
  is_active?: boolean;
}

export const languageService = {
  async list(search?: string): Promise<CourseLanguageItem[]> {
    const params = search ? { search } : {};
    const response = await apiClient.get<BackendApiResponse<CourseLanguageItem[]> | CourseLanguageItem[]>(
      "/api/v1/courses/course-languages/",
      { params }
    );
    const data = (response.data as any)?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  async create(name: string, code: string = ""): Promise<CourseLanguageItem> {
    const response = await apiClient.post<BackendApiResponse<CourseLanguageItem>>(
      "/api/v1/courses/course-languages/",
      { name, code }
    );
    return (response.data as any)?.data || (response.data as unknown as CourseLanguageItem);
  },
};

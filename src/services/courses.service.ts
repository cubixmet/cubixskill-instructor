import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { BackendApiResponse, PaginatedResponse } from "../api/types";

export interface CourseData {
  id?: string;
  uuid?: string;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  category: string;
  subcategory?: string;
  level: string;
  language?: string;
  price: number;
  isFree?: boolean;
  status?: string;
  thumbnailUrl?: string;
  tags?: string[];
}

export const coursesService = {
  async listCourses(params?: Record<string, any>): Promise<PaginatedResponse<CourseData> | CourseData[]> {
    const response = await apiClient.get<BackendApiResponse<PaginatedResponse<CourseData>> | CourseData[]>(
      API_ENDPOINTS.COURSES.LIST,
      { params }
    );
    const data = (response.data as any)?.data || response.data;
    return data;
  },

  async getCourse(id: string): Promise<CourseData> {
    const response = await apiClient.get<BackendApiResponse<CourseData>>(API_ENDPOINTS.COURSES.DETAIL(id));
    return response.data?.data || (response.data as unknown as CourseData);
  },

  async createCourse(payload: Partial<CourseData>): Promise<CourseData> {
    const response = await apiClient.post<BackendApiResponse<CourseData>>(API_ENDPOINTS.COURSES.LIST, payload);
    return response.data?.data || (response.data as unknown as CourseData);
  },

  async updateCourse(id: string, payload: Partial<CourseData>): Promise<CourseData> {
    const response = await apiClient.patch<BackendApiResponse<CourseData>>(
      API_ENDPOINTS.COURSES.DETAIL(id),
      payload
    );
    return response.data?.data || (response.data as unknown as CourseData);
  },

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.COURSES.DETAIL(id));
  },
};

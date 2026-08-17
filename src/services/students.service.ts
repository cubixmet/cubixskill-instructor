import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { BackendApiResponse, PaginatedResponse } from "../api/types";

export interface StudentData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrolledCoursesCount?: number;
  joinedAt?: string;
}

export const studentsService = {
  async listStudents(params?: Record<string, any>): Promise<PaginatedResponse<StudentData> | StudentData[]> {
    const response = await apiClient.get<BackendApiResponse<PaginatedResponse<StudentData>> | StudentData[]>(
      API_ENDPOINTS.STUDENTS.LIST,
      { params }
    );
    return (response.data as any)?.data || response.data;
  },

  async getStudent(id: string): Promise<StudentData> {
    const response = await apiClient.get<BackendApiResponse<StudentData>>(API_ENDPOINTS.STUDENTS.DETAIL(id));
    return response.data?.data || (response.data as unknown as StudentData);
  },

  async enrollStudent(payload: { student_id: string; course_id: string }): Promise<any> {
    const response = await apiClient.post<BackendApiResponse<any>>(API_ENDPOINTS.STUDENTS.ENROLL, payload);
    return response.data?.data || response.data;
  },
};

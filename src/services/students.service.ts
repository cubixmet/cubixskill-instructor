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

  async listCourseEnrollments(courseId: string, params?: Record<string, any>): Promise<any[]> {
    const response = await apiClient.get<BackendApiResponse<any[]> | any[]>(
      '/api/v1/enrollments/enrollments/',
      { params: { course: courseId, ...params } }
    );
    const data = (response.data as any)?.data || response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  async sendStudentEmail(studentId: string, payload: { subject: string; message: string }): Promise<any> {
    const response = await apiClient.post<BackendApiResponse<any>>(
      `/api/v1/students/students/${studentId}/send-email/`,
      payload
    );
    return response.data?.data || response.data;
  },

  async createEnrollment(payload: {
    student_id: string;
    course_id: string;
    access_type?: string;
    source?: string;
    is_lifetime?: boolean;
    access_expires_at?: string;
  }): Promise<any> {
    const response = await apiClient.post<BackendApiResponse<any>>(
      '/api/v1/enrollments/enrollments/',
      payload
    );
    return response.data?.data || response.data;
  },

  async createStudent(payload: { full_name: string; email: string; phone?: string }): Promise<StudentData> {
    const response = await apiClient.post<BackendApiResponse<StudentData>>(
      API_ENDPOINTS.STUDENTS.LIST,
      payload
    );
    return response.data?.data || (response.data as unknown as StudentData);
  },

  async bulkEnroll(payload: {
    student_ids: string[];
    course_id: string;
    access_type?: string;
    is_lifetime?: boolean;
    access_expires_at?: string;
  }): Promise<any> {
    const response = await apiClient.post<BackendApiResponse<any>>(
      '/api/v1/enrollments/enrollments/bulk/',
      payload
    );
    return response.data?.data || response.data;
  },
};

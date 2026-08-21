import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { BackendApiResponse, PaginatedResponse } from "../api/types";

export interface StudentData {
  id: string;
  user_id?: string;
  userId?: string;
  student_code?: string;
  studentCode?: string;
  display_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
  };
  status?: string;
  joined_at?: string;
  enrolledCoursesCount?: number;
}

export interface BulkUploadRowResult {
  row: number;
  name: string;
  email: string;
  student_code?: string;
  student_user_id?: string;
  student_profile_id?: string;
  student_created: boolean;
  enrollment_created: boolean;
  activation_email_sent: boolean;
  status: 'valid' | 'invalid' | 'duplicate';
  message?: string;
  errorMessage?: string;
}

export interface BulkUploadResponse {
  total_rows: number;
  valid_count: number;
  invalid_count: number;
  duplicate_count: number;
  enrolled_count: number;
  results: BulkUploadRowResult[];
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

  async resendActivationEmail(studentId: string): Promise<any> {
    const response = await apiClient.post<BackendApiResponse<any>>(
      `/api/v1/students/students/${studentId}/resend-activation/`
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

  async bulkUploadStudents(payload: {
    course_id: string;
    rows: Array<{ name?: string; full_name?: string; email: string; phone?: string }>;
  }): Promise<BulkUploadResponse> {
    const response = await apiClient.post<BackendApiResponse<BulkUploadResponse>>(
      '/api/v1/students/students/bulk-upload/',
      payload
    );
    return response.data?.data || (response.data as unknown as BulkUploadResponse);
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


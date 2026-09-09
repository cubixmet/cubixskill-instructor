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
  full_name?: string;
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
  date_of_birth?: string;
  bio?: string;
  profile_photo?: any;
  profile_photo_url?: string;
  avatar_url?: string;
  avatarUrl?: string;
  enrollments_count?: number;
  enrolledCoursesCount?: number;
}

export interface StudentSummaryData {
  total_students: number;
  active_students: number;
  inactive_students: number;
  enrolled_students: number;
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

export interface ModuleProgressItem {
  uuid: string;
  title: string;
  completed_lessons: number;
  total_lessons: number;
  percentage: number;
}

export interface LessonProgressItem {
  uuid: string;
  module_uuid?: string;
  title: string;
  type: string;
  completed: boolean;
  completed_at?: string | null;
}

export interface QuizAttemptItem {
  id: string;
  quiz_title?: string;
  score?: number;
  passed?: boolean;
  attempt_date?: string;
}

export interface AssignmentSubmissionItem {
  id: string;
  assignment_title?: string;
  status?: string;
  grade?: string | number;
  submitted_date?: string;
}

export interface ActivityItem {
  id: string;
  activity_type: string;
  lesson_title?: string;
  details?: Record<string, any>;
  timestamp?: string | null;
}

export interface CertificateItem {
  id: string;
  certificate_number: string;
  issued_at?: string | null;
  status: string;
}

export interface StudentCourseOverview {
  student: {
    uuid: string;
    profile_uuid?: string | null;
    full_name: string;
    email: string;
    phone?: string;
    student_code: string;
    avatar?: string | null;
    status: string;
  };
  course: {
    uuid: string;
    title: string;
  };
  enrollment: {
    uuid: string;
    status: string;
    enrolled_at: string;
    completed_at?: string | null;
  };
  progress: {
    completed_lessons: number;
    total_lessons: number;
    percentage: number;
  };
  modules: ModuleProgressItem[];
  lessons: LessonProgressItem[];
  quiz_attempts: QuizAttemptItem[];
  assignment_submissions: AssignmentSubmissionItem[];
  activities: ActivityItem[];
  certificates: CertificateItem[];
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
    const response = await apiClient.get<BackendApiResponse<PaginatedResponse<StudentData>> | PaginatedResponse<StudentData> | StudentData[]>(
      API_ENDPOINTS.STUDENTS.LIST,
      { params }
    );
    const data = (response.data as any)?.data || response.data;
    return data;
  },

  async getSummary(): Promise<StudentSummaryData> {
    const response = await apiClient.get<BackendApiResponse<StudentSummaryData>>(
      '/api/v1/students/students/summary/'
    );
    return response.data?.data || (response.data as unknown as StudentSummaryData);
  },

  async getStudent(id: string): Promise<StudentData> {
    const response = await apiClient.get<BackendApiResponse<StudentData>>(API_ENDPOINTS.STUDENTS.DETAIL(id));
    return response.data?.data || (response.data as unknown as StudentData);
  },

  async updateStudent(id: string, payload: Partial<StudentData>): Promise<StudentData> {
    const response = await apiClient.patch<BackendApiResponse<StudentData>>(
      API_ENDPOINTS.STUDENTS.DETAIL(id),
      payload
    );
    return response.data?.data || (response.data as unknown as StudentData);
  },

  async activateStudent(id: string): Promise<any> {
    const response = await apiClient.post<BackendApiResponse<any>>(
      `/api/v1/students/students/${id}/activate/`
    );
    return response.data?.data || response.data;
  },

  async deactivateStudent(id: string): Promise<any> {
    const response = await apiClient.post<BackendApiResponse<any>>(
      `/api/v1/students/students/${id}/deactivate/`
    );
    return response.data?.data || response.data;
  },

  async listStudentEnrollments(studentId: string, params?: Record<string, any>): Promise<any[]> {
    const response = await apiClient.get<BackendApiResponse<any[]> | any[]>(
      '/api/v1/enrollments/enrollments/',
      { params: { student: studentId, ...params } }
    );
    const data = (response.data as any)?.data || response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
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

  async createStudent(payload: { full_name: string; email: string; phone?: string; date_of_birth?: string; bio?: string; status?: string }): Promise<StudentData> {
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

  async getStudentCourseOverview(courseUuid: string, studentUuid: string): Promise<StudentCourseOverview> {
    const response = await apiClient.get<BackendApiResponse<StudentCourseOverview> | StudentCourseOverview>(
      `/api/v1/courses/${courseUuid}/students/${studentUuid}/overview/`
    );
    return (response.data as any)?.data || (response.data as unknown as StudentCourseOverview);
  },
};

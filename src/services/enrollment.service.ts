import { apiClient } from '../api/client';

export interface CreateEnrollmentPayload {
  student_id: string;
  course_id: string;
  access_type?: 'FULL' | 'DEMO';
  source?: 'MANUAL';
  is_lifetime?: boolean;
  access_expires_at?: string;
}

export const enrollmentService = {
  create: async (payload: CreateEnrollmentPayload) => {
    const response = await apiClient.post(
      '/api/v1/enrollments/enrollments/',
      payload
    );
    return response.data?.data ?? response.data;
  },
};

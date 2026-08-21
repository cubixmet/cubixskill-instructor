import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export interface CourseFeeData {
  course_id: string;
  course_title: string;
  is_free: boolean;
  price: string;
  sale_price: string | null;
  currency: string;
  demo_enabled: boolean;
  demo_duration_days: number;
  certificate_enabled: boolean;
  revenue_summary: {
    total_revenue: number;
    paid_enrollments: number;
    amount_collected: number;
    pending_payments: number;
    refunded_payments: number;
  };
}

export interface UpdateCourseFeesPayload {
  is_free: boolean;
  price?: number | string;
  sale_price?: number | string | null;
  currency?: string;
  demo_enabled?: boolean;
  demo_duration_days?: number;
  certificate_enabled?: boolean;
}

export const courseFeesService = {
  async getFees(courseUuid: string): Promise<CourseFeeData> {
    const response = await apiClient.get(`${API_ENDPOINTS.COURSES.LIST}${courseUuid}/fees/`);
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data && data.data) {
      return data.data as CourseFeeData;
    }
    return data as CourseFeeData;
  },

  async updateFees(courseUuid: string, payload: UpdateCourseFeesPayload): Promise<CourseFeeData> {
    const response = await apiClient.patch(`${API_ENDPOINTS.COURSES.LIST}${courseUuid}/fees/`, payload);
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data && data.data) {
      return data.data as CourseFeeData;
    }
    return data as CourseFeeData;
  },
};

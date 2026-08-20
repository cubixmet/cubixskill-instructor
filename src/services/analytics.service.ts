import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { BackendApiResponse } from "../api/types";
import type {
  BackendDashboardAnalytics,
  BackendCourseAnalytics,
  BackendRevenueAnalytics,
} from "../features/dashboard/types/analytics.types";

export const analyticsService = {
  async getDashboard(): Promise<BackendDashboardAnalytics> {
    const response = await apiClient.get<BackendApiResponse<BackendDashboardAnalytics>>(
      API_ENDPOINTS.ANALYTICS.DASHBOARD
    );
    return response.data?.data || (response.data as unknown as BackendDashboardAnalytics);
  },

  async getCourseAnalytics(): Promise<BackendCourseAnalytics[]> {
    const response = await apiClient.get<BackendApiResponse<BackendCourseAnalytics[]>>(
      API_ENDPOINTS.ANALYTICS.COURSES
    );
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  async getRevenueAnalytics(): Promise<BackendRevenueAnalytics> {
    const response = await apiClient.get<BackendApiResponse<BackendRevenueAnalytics>>(
      API_ENDPOINTS.ANALYTICS.REVENUE
    );
    return response.data?.data || (response.data as unknown as BackendRevenueAnalytics);
  },
};

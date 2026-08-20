import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/auth.store";
import { analyticsService } from "../../../services/analytics.service";
import { getRoleLabel } from "../../../utils/branding.utils";
import type {
  BackendDashboardAnalytics,
  BackendCourseAnalytics,
  BackendRevenueAnalytics,
} from "../types/analytics.types";
import type { DashboardWelcome } from "../types/dashboard.types";

export interface DashboardDataState {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  welcome: DashboardWelcome | null;
  dashboardAnalytics: BackendDashboardAnalytics | null;
  courseAnalytics: BackendCourseAnalytics[];
  revenueAnalytics: BackendRevenueAnalytics;
  refetch: () => void;
}

export const useDashboardData = (): DashboardDataState => {
  const { user, academy, isAuthenticated, isInitializing } = useAuthStore();

  const enabled = !isInitializing && isAuthenticated;

  const dashboardQuery = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: () => analyticsService.getDashboard(),
    enabled,
    staleTime: 60 * 1000,
  });

  const courseQuery = useQuery({
    queryKey: ["course-analytics"],
    queryFn: () => analyticsService.getCourseAnalytics(),
    enabled,
    staleTime: 60 * 1000,
  });

  const revenueQuery = useQuery({
    queryKey: ["revenue-analytics"],
    queryFn: () => analyticsService.getRevenueAnalytics(),
    enabled,
    staleTime: 60 * 1000,
  });

  const isLoading = isInitializing || dashboardQuery.isLoading;
  const isError = dashboardQuery.isError;
  const errorMessage = dashboardQuery.error
    ? (dashboardQuery.error as any)?.message || "Failed to load dashboard analytics data."
    : null;

  const refetch = useCallback(() => {
    dashboardQuery.refetch();
    courseQuery.refetch();
    revenueQuery.refetch();
  }, [dashboardQuery, courseQuery, revenueQuery]);

  const welcome: DashboardWelcome | null = user
    ? {
        instructorName: user.full_name || "Instructor",
        role: getRoleLabel(user.role, user.assigned_role_name),
        academyName: academy?.name || "CubixSkill Academy",
        greeting: `Welcome Back, ${user.full_name || "Instructor"}`,
        status: academy?.status === "ACTIVE" ? "Active License" : "Standard Workspace",
        todayDate: new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }
    : null;

  return {
    isLoading,
    isError,
    errorMessage,
    welcome,
    dashboardAnalytics: dashboardQuery.data || null,
    courseAnalytics: courseQuery.data || [],
    revenueAnalytics: revenueQuery.data || {},
    refetch,
  };
};

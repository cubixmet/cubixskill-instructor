export interface BackendDashboardAnalytics {
  total_students: number;
  active_students: number;
  total_courses: number;
  published_courses: number;
  active_enrollments: number;
  course_completions: number;
  revenue_by_currency: Record<string, string>;
  total_leads: number;
  new_leads: number;
  converted_leads: number;
  lead_conversion_rate: string;
  upcoming_live_sessions: number;
  storage_gb: string;
  credit_balance: string;
  certificates_issued: number;
}

export interface BackendCourseAnalytics {
  course_id: string;
  course_title: string;
  total_enrollments: number;
  active_students: number;
  completed_students: number;
  completion_rate: string;
  average_progress_percent: string;
  revenue: string;
}

export interface CurrencyRevenueMetric {
  gross_revenue: string;
  total_refunds: string;
  net_revenue: string;
}

export type BackendRevenueAnalytics = Record<string, CurrencyRevenueMetric>;

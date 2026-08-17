import { api } from '../../../lib/api';

import { api } from '../../../lib/api';

export const DATA_SOURCE: 'mock' | 'api' = 'api';

export const mockDashboardData = {
  welcome: {
    instructorName: "",
    role: "Academy Admin",
    academyName: "",
    greeting: "",
    status: "",
    lastUpdated: "Just now",
  },
  stats: {
    totalRevenue: 0,
    totalSales: 0,
    totalStudents: 0,
    activeStudents: 0,
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    pendingAssignments: 0,
    quizAttempts: 0,
    completionRate: 0,
    availableCredits: 0,
    usedCreditsThisMonth: 0,
    purchasedCredits: 0,
    estimatedUpcomingCredits: 0,
    mediaCreditsUsedThisMonth: 0,
    totalMediaUploadedGB: 0,
    storageUsedGB: 0,
    storageTotalGB: 0,
  },
  revenueAnalytics: [],
  enrollmentsTrend: [],
  topCourses: [],
  recentOrders: [],
  recentEnrollments: [],
  pendingAssignments: [],
  creditUsageBreakdown: [],
  recentActivities: [],
  alerts: [],
  supportSummary: {
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: "-",
    liveChatAvailable: false,
  },
};

export const dashboardService = {
  async getDashboardSummary() {
    if (DATA_SOURCE === 'mock') {
      return mockDashboardData;
    }
    const response = await api.get('/analytics/dashboard/');
    return response.data?.data || response.data;
  },
};


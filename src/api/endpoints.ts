export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login/",
    LOGOUT: "/api/v1/auth/logout/",
    ME: "/api/v1/auth/me/",
    REFRESH: "/api/v1/auth/token/refresh/",
    VALIDATE_TOKEN: "/api/v1/auth/token/validate/",
    FORGOT_PASSWORD: "/api/v1/auth/password/forgot/",
    RESET_PASSWORD: "/api/v1/auth/password/reset/",
    CHANGE_PASSWORD: "/api/v1/auth/password/change/",
    SETUP_PASSWORD: "/api/v1/auth/password/setup/",
    RESEND_EMAIL: "/api/v1/auth/email/resend/",
  },
  ACADEMY: {
    DETAIL: "/api/v1/academy/",
    PROFILE: "/api/v1/academy/profile/",
    SETTINGS: "/api/v1/academy/settings/",
  },

  COURSES: {
    LIST: "/api/v1/courses/",
    DETAIL: (id: string) => `/api/v1/courses/${id}/`,
    MODULES: (courseId: string) => `/api/v1/modules/courses/${courseId}/modules/`,
  },

  STUDENTS: {
    LIST: "/api/v1/students/students/",
    DETAIL: (id: string) => `/api/v1/students/students/${id}/`,
    ENROLL: "/api/v1/students/students/enroll/",
  },
  DASHBOARD: {
    STATS: "/api/v1/dashboard/stats/",
  },
  ANALYTICS: {
    DASHBOARD: "/api/v1/analytics/analytics/dashboard/",
    COURSES: "/api/v1/analytics/analytics/courses/",
    REVENUE: "/api/v1/analytics/analytics/revenue/",
  },

  ASSIGNMENTS: {
    LIST: "/api/v1/assignments/",
    DETAIL: (id: string) => `/api/v1/assignments/${id}/`,
  },
  LIVE_SESSIONS: {
    LIST: "/api/v1/live-classes/live-sessions/",
    SUMMARY: "/api/v1/live-classes/live-sessions/summary/",
    DETAIL: (id: string) => `/api/v1/live-classes/live-sessions/${id}/`,
    START: (id: string) => `/api/v1/live-classes/live-sessions/${id}/start/`,
    END: (id: string) => `/api/v1/live-classes/live-sessions/${id}/end/`,
    CANCEL: (id: string) => `/api/v1/live-classes/live-sessions/${id}/cancel/`,
    JOIN: (id: string) => `/api/v1/live-classes/live-sessions/${id}/join/`,
    LEAVE: (id: string) => `/api/v1/live-classes/live-sessions/${id}/leave/`,
    ATTENDANCE: (id: string) => `/api/v1/live-classes/live-sessions/${id}/attendance/`,
  },
  SETTINGS: {
    PROFILE: "/api/v1/settings/profile/",
  },
} as const;

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
    SETTINGS: "/api/v1/academy/settings/",
  },
  COURSES: {
    LIST: "/api/v1/courses/",
    DETAIL: (id: string) => `/api/v1/courses/${id}/`,
    MODULES: (courseId: string) => `/api/v1/courses/${courseId}/modules/`,
    LESSONS: (courseId: string, moduleId: string) => `/api/v1/courses/${courseId}/modules/${moduleId}/lessons/`,
  },
  STUDENTS: {
    LIST: "/api/v1/students/",
    DETAIL: (id: string) => `/api/v1/students/${id}/`,
    ENROLL: "/api/v1/students/enroll/",
  },
  DASHBOARD: {
    STATS: "/api/v1/dashboard/stats/",
  },
  ASSIGNMENTS: {
    LIST: "/api/v1/assignments/",
    DETAIL: (id: string) => `/api/v1/assignments/${id}/`,
  },
  SETTINGS: {
    PROFILE: "/api/v1/settings/profile/",
  },
} as const;

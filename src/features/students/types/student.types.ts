export type StudentStatus = 'Active' | 'Completed' | 'Suspended' | 'Inactive';

export interface StudentCourseProgress {
  courseUuid: string;
  courseTitle: string;
  enrolledAt: string;
  progressPercent: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  assignmentsSubmitted: number;
  certificatesEarned: number;
  creditsConsumed: number;
}

export interface StudentActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface StudentDetail {
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  countryCode?: string;
  country?: string;
  avatarUrl?: string;
  status: StudentStatus;
  enrollmentDate: string;
  lastActivity: string;
  notes?: string;
  creditsConsumed: number;
  enrolledCourses: StudentCourseProgress[];
  activityLogs: StudentActivityLog[];
}

export type CreateStudentInput = Omit<
  StudentDetail,
  'uuid' | 'enrollmentDate' | 'lastActivity' | 'creditsConsumed' | 'enrolledCourses' | 'activityLogs'
>;

export type UpdateStudentInput = Partial<CreateStudentInput>;

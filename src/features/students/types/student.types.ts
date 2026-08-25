export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'Active' | 'Inactive' | 'Suspended' | 'Completed';

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
  id: string;
  uuid: string;
  user_id?: string;
  userId?: string;
  name: string;
  full_name?: string;
  display_name?: string;
  email: string;
  phone?: string;
  student_code?: string;
  studentCode?: string;
  avatarUrl?: string;
  profile_photo?: any;
  status: StudentStatus;
  enrollmentDate: string;
  joined_at?: string;
  lastActivity: string;
  date_of_birth?: string | null;
  bio?: string;
  notes?: string;
  creditsConsumed: number;
  enrollments_count?: number;
  enrolledCourses: StudentCourseProgress[];
  activityLogs: StudentActivityLog[];
}

export type CreateStudentInput = {
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string | null;
  bio?: string;
  status?: string;
};

export type UpdateStudentInput = Partial<CreateStudentInput> & {
  name?: string;
  display_name?: string;
  notes?: string;
};

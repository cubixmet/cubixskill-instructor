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
  id?: string;
  uuid: string;
  user_id?: string;
  userId?: string;
  name: string;
  full_name?: string;
  display_name?: string;
  email: string;
  phone?: string;
  countryCode?: string;
  country?: string;
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
  name?: string;
  full_name?: string;
  email: string;
  phone?: string;
  countryCode?: string;
  country?: string;
  date_of_birth?: string | null;
  bio?: string;
  status?: string;
  notes?: string;
};

export type UpdateStudentInput = Partial<CreateStudentInput> & {
  name?: string;
  display_name?: string;
  notes?: string;
};

export const normalizeStudent = (
  raw: Partial<Omit<StudentDetail, 'status'>> & { status?: string | StudentStatus; full_name?: string; name?: string; email?: string }
): StudentDetail => {
  const name = raw.name || raw.full_name || raw.email?.split('@')[0] || 'Unknown Student';
  return {
    id: raw.id || raw.uuid || '',
    uuid: raw.uuid || raw.id || '',
    name,
    full_name: raw.full_name || name,
    display_name: raw.display_name || name,
    email: raw.email || '',
    phone: raw.phone || '',
    countryCode: raw.countryCode || '+91',
    country: raw.country || 'India',
    status: (raw.status as StudentStatus) || 'Active',
    enrollmentDate: raw.enrollmentDate || raw.joined_at || new Date().toISOString(),
    lastActivity: raw.lastActivity || 'Just now',
    date_of_birth: raw.date_of_birth ?? null,
    bio: raw.bio || '',
    notes: raw.notes || '',
    creditsConsumed: raw.creditsConsumed ?? 0,
    enrolledCourses: Array.isArray(raw.enrolledCourses) ? raw.enrolledCourses : [],
    activityLogs: Array.isArray(raw.activityLogs) ? raw.activityLogs : [],
  };
};

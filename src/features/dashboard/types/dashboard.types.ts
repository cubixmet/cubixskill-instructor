export interface DashboardWelcome {
  instructorName: string;
  role: string;
  academyName: string;
  greeting: string;
  status: string;
  lastUpdated?: string;
  todayDate: string;
}

export interface DashboardSummaryStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  availableCredits: number;
  usedCreditsThisMonth: number;
  purchasedCredits: number;
  estimatedUpcomingCredits: number;
  storageUsedGB: number;
  storageTotalGB: number;
  certificatesIssued: number;
  certificatesDownloaded: number;
  certificatesVerified: number;
  pendingAssignments: number;
  quizAttemptsPending: number;
  communityMembers: number;
  completionRate: number;
  totalSales: number;
  mediaCreditsUsedThisMonth?: number;
  totalMediaUploadedGB?: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  sales: number;
  students: number;
  creditsUsed: number;
}

export interface EnrollmentDataPoint {
  date: string;
  newStudents: number;
  returningStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  completionRate: number;
}

export interface CoursePerformanceItem {
  id: string;
  title: string;
  thumbnail?: string;
  status: string;
  studentsCount: number;
  revenue: number;
  completionRate: number;
  rating: number;
  certificatesCount: number;
  creditsPerStudent?: number;
}

export interface RecentEnrollmentItem {
  id: string;
  name: string;
  avatar: string;
  course: string;
  time: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Expired' | 'Refunded';
  creditsDeducted: number;
  paymentStatus: string;
}

export interface PendingAssignmentItem {
  id: string;
  title: string;
  student: string;
  submitted: string;
  course: string;
  dueDate?: string;
  priority: 'Normal' | 'Due Soon' | 'Overdue';
  attemptNumber?: number;
  type: 'assignment' | 'quiz_review' | 'certificate_request' | 'system_alert';
}

export interface StorageBreakdownItem {
  type: 'Video' | 'Audio' | 'PDF' | 'Images' | 'Documents';
  sizeGB: number;
  fileCount: number;
  percentage: number;
  color: string;
}

export interface CertificateStats {
  templates: number;
  issued: number;
  downloaded: number;
  verified: number;
}

export interface AssignmentWidgetStats {
  pendingReview: number;
  approvedToday: number;
  lateSubmissions: number;
}

export interface QuizWidgetStats {
  published: number;
  draft: number;
  averageScore: number;
  passRate: number;
  manualReviews: number;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  category: 'Update' | 'Maintenance' | 'Event' | 'Feature';
  date: string;
  isPinned: boolean;
  author: string;
  readTime?: string;
}

export interface TransactionItem {
  id: string;
  type: 'Credits Purchased' | 'Subscription Renewal' | 'Refund Processed' | 'Credit Transfer';
  amount: number;
  credits?: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  invoiceUrl?: string;
}

export interface ActivityTimelineItem {
  id: string;
  type: 'Student Enrolled' | 'Course Purchased' | 'Assignment Submitted' | 'Quiz Completed' | 'Certificate Generated' | 'Credits Purchased' | 'Media Uploaded';
  description: string;
  user: string;
  timestamp: string;
  iconName?: string;
  link?: string;
}

export interface DashboardAlertItem {
  id: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  description: string;
  timestamp: string;
  primaryAction?: { label: string; href: string };
}

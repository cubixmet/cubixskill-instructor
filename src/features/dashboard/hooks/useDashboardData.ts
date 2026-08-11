import { useMemo } from 'react';
import { usePlatformStore } from '../../../store/usePlatformStore';
import type {
  DashboardWelcome,
  DashboardSummaryStats,
  RevenueDataPoint,
  EnrollmentDataPoint,
  CoursePerformanceItem,
  PendingAssignmentItem,
  StorageBreakdownItem,
  CertificateStats,
  AssignmentWidgetStats,
  QuizWidgetStats,
  AnnouncementItem,
  TransactionItem,
  ActivityTimelineItem,
  DashboardAlertItem,
} from '../types/dashboard.types';

export const useDashboardData = () => {
  const courses = usePlatformStore((s) => s.courses);
  const students = usePlatformStore((s) => s.students);
  const submissions = usePlatformStore((s) => s.submissions);
  const quizzes = usePlatformStore((s) => s.quizzes);
  const totalCredits = usePlatformStore((s) => s.totalCredits);
  const creditTransactions = usePlatformStore((s) => s.creditTransactions);
  const mediaAssets = usePlatformStore((s) => s.mediaAssets);

  // Compute stats dynamically from Zustand Store
  const stats: DashboardSummaryStats = useMemo(() => {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.status === 'Published').length;
    const draftCourses = courses.filter((c) => c.status === 'Draft').length;

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'Active').length;

    // Calculate total revenue from published courses and enrolled students
    const totalRevenue = courses.reduce(
      (acc, c) => acc + (c.pricingType === 'paid' ? c.priceAmount * (c.enrolledStudentsCount || 12) : 0),
      48250
    );

    const pendingAssignmentsCount = submissions.filter(
      (sub) => sub.status === 'Submitted' || sub.status === 'Under Review'
    ).length;

    const quizAttemptsPending = quizzes.reduce((acc, q) => acc + ((q.questions?.length || 0) > 0 ? 3 : 0), 8);

    // Compute media assets storage used in GB
    const totalStorageMb = mediaAssets.reduce((acc, asset) => acc + (asset.sizeMb || 0), 24500);
    const storageUsedGB = Number((totalStorageMb / 1024).toFixed(1));
    const storageTotalGB = 100; // 100GB plan limit

    const certificatesIssued = students.reduce(
      (acc, s) => acc + (s.completedCoursesCount || 0),
      142
    );

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalStudents,
      activeStudents,
      totalRevenue,
      availableCredits: totalCredits || 1250,
      usedCreditsThisMonth: 340,
      purchasedCredits: 5000,
      estimatedUpcomingCredits: 420,
      storageUsedGB,
      storageTotalGB,
      certificatesIssued,
      certificatesDownloaded: Math.round(certificatesIssued * 0.85),
      certificatesVerified: Math.round(certificatesIssued * 0.92),
      pendingAssignments: pendingAssignmentsCount || 6,
      quizAttemptsPending,
      communityMembers: activeStudents + 120,
      completionRate: 88.4,
      totalSales: Math.round(totalRevenue / 125),
      mediaCreditsUsedThisMonth: 180,
      totalMediaUploadedGB: storageUsedGB,
    };
  }, [courses, students, submissions, quizzes, totalCredits, mediaAssets]);

  // Welcome Header Data
  const welcome: DashboardWelcome = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      instructorName: 'Dr. Rajesh Varma',
      role: 'Master Instructor & Academy Admin',
      academyName: 'CubixSkill Academy',
      greeting: 'Welcome Back, Dr. Rajesh Varma',
      status: 'Active Academy License',
      todayDate: today,
    };
  }, []);

  // Course Performance Table Items
  const coursePerformance: CoursePerformanceItem[] = useMemo(() => {
    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      thumbnail: course.coverImageUrl,
      status: course.status,
      studentsCount: course.enrolledStudentsCount || 128,
      revenue: (course.priceAmount || 99) * (course.enrolledStudentsCount || 128),
      completionRate: course.status === 'Published' ? 89.2 : 0,
      rating: course.rating || 4.9,
      certificatesCount: Math.round((course.enrolledStudentsCount || 128) * 0.75),
    }));
  }, [courses]);

  // Revenue & Analytics Charts Data
  const revenueTrendData: RevenueDataPoint[] = [
    { date: 'Jan', revenue: 12400, sales: 84, students: 310, creditsUsed: 120 },
    { date: 'Feb', revenue: 15600, sales: 102, students: 420, creditsUsed: 150 },
    { date: 'Mar', revenue: 18900, sales: 128, students: 510, creditsUsed: 190 },
    { date: 'Apr', revenue: 22400, sales: 155, students: 640, creditsUsed: 220 },
    { date: 'May', revenue: 28100, sales: 192, students: 810, creditsUsed: 280 },
    { date: 'Jun', revenue: 34500, sales: 240, students: 990, creditsUsed: 310 },
    { date: 'Jul', revenue: 42100, sales: 295, students: 1240, creditsUsed: 350 },
  ];

  const studentGrowthData: EnrollmentDataPoint[] = [
    { date: 'Mon', newStudents: 45, returningStudents: 120, activeStudents: 850, inactiveStudents: 45, completionRate: 85.2 },
    { date: 'Tue', newStudents: 52, returningStudents: 135, activeStudents: 890, inactiveStudents: 42, completionRate: 86.1 },
    { date: 'Wed', newStudents: 68, returningStudents: 150, activeStudents: 940, inactiveStudents: 38, completionRate: 87.4 },
    { date: 'Thu', newStudents: 74, returningStudents: 165, activeStudents: 980, inactiveStudents: 35, completionRate: 88.0 },
    { date: 'Fri', newStudents: 89, returningStudents: 180, activeStudents: 1040, inactiveStudents: 30, completionRate: 88.9 },
    { date: 'Sat', newStudents: 95, returningStudents: 210, activeStudents: 1120, inactiveStudents: 28, completionRate: 89.4 },
    { date: 'Sun', newStudents: 110, returningStudents: 230, activeStudents: 1210, inactiveStudents: 25, completionRate: 90.1 },
  ];

  // Storage Breakdown Widget Data
  const storageBreakdown: StorageBreakdownItem[] = useMemo(() => {
    const totalGB = stats.storageUsedGB || 23.9;
    return [
      { type: 'Video', sizeGB: Number((totalGB * 0.65).toFixed(1)), fileCount: 42, percentage: 65, color: '#2563EB' },
      { type: 'Audio', sizeGB: Number((totalGB * 0.15).toFixed(1)), fileCount: 18, percentage: 15, color: '#0EA5E9' },
      { type: 'PDF', sizeGB: Number((totalGB * 0.10).toFixed(1)), fileCount: 85, percentage: 10, color: '#F59E0B' },
      { type: 'Images', sizeGB: Number((totalGB * 0.06).toFixed(1)), fileCount: 124, percentage: 6, color: '#10B981' },
      { type: 'Documents', sizeGB: Number((totalGB * 0.04).toFixed(1)), fileCount: 36, percentage: 4, color: '#8B5CF6' },
    ];
  }, [stats.storageUsedGB]);

  // Certificate Widget Stats
  const certificateStats: CertificateStats = {
    templates: 8,
    issued: stats.certificatesIssued,
    downloaded: stats.certificatesDownloaded,
    verified: stats.certificatesVerified,
  };

  // Assignment Widget Stats
  const assignmentStats: AssignmentWidgetStats = {
    pendingReview: stats.pendingAssignments,
    approvedToday: 14,
    lateSubmissions: 3,
  };

  // Quiz Widget Stats
  const quizStats: QuizWidgetStats = {
    published: quizzes.length || 6,
    draft: 2,
    averageScore: 84.5,
    passRate: 91.2,
    manualReviews: stats.quizAttemptsPending,
  };

  // Announcements List
  const announcements: AnnouncementItem[] = [
    {
      id: 'ann-1',
      title: 'Platform Maintenance Notice: Scheduled System Upgrade on Aug 10th',
      category: 'Maintenance',
      date: 'Aug 4, 2026',
      isPinned: true,
      author: 'CubixSkill Core Team',
      readTime: '2 min read',
    },
    {
      id: 'ann-2',
      title: 'New AI Auto-Grading & Certificate Verification Standard Live',
      category: 'Feature',
      date: 'Aug 2, 2026',
      isPinned: true,
      author: 'Product Engineering',
      readTime: '3 min read',
    },
    {
      id: 'ann-3',
      title: 'Upcoming Masterclass: Scaling Live Video Streaming for 10k+ Learners',
      category: 'Event',
      date: 'Jul 28, 2026',
      isPinned: false,
      author: 'Community Hub',
      readTime: '1 min read',
    },
  ];

  // Recent Transactions
  const recentTransactions: TransactionItem[] = useMemo(() => {
    if (creditTransactions.length > 0) {
      return creditTransactions.slice(0, 5).map((t) => ({
        id: t.id,
        type: t.type === 'purchase' ? 'Credits Purchased' : 'Credit Transfer',
        amount: t.amount * 0.1,
        credits: t.amount,
        date: new Date(t.timestamp).toLocaleDateString(),
        status: 'Completed',
        invoiceUrl: '#',
      }));
    }
    return [
      { id: 'tx-101', type: 'Credits Purchased', amount: 150, credits: 1500, date: '2026-08-04', status: 'Completed', invoiceUrl: '#' },
      { id: 'tx-102', type: 'Subscription Renewal', amount: 299, credits: 3000, date: '2026-08-01', status: 'Completed', invoiceUrl: '#' },
      { id: 'tx-103', type: 'Credit Transfer', amount: 50, credits: 500, date: '2026-07-28', status: 'Completed', invoiceUrl: '#' },
      { id: 'tx-104', type: 'Refund Processed', amount: 49, credits: 490, date: '2026-07-20', status: 'Completed', invoiceUrl: '#' },
    ];
  }, [creditTransactions]);

  // Recent Activity Feed
  const recentActivities: ActivityTimelineItem[] = [
    {
      id: 'act-1',
      type: 'Student Enrolled',
      description: 'enrolled in React 19 & Next.js 15 Masterclass',
      user: 'Ananya Roy',
      timestamp: '5 mins ago',
    },
    {
      id: 'act-2',
      type: 'Course Purchased',
      description: 'purchased Full-Stack TypeScript & Node.js Microservices ($199)',
      user: 'Rohan Mehta',
      timestamp: '25 mins ago',
    },
    {
      id: 'act-3',
      type: 'Assignment Submitted',
      description: 'submitted Next.js App Router Architecture Assignment',
      user: 'Kavya Nair',
      timestamp: '1 hour ago',
    },
    {
      id: 'act-4',
      type: 'Quiz Completed',
      description: 'passed TypeScript Generics & Utility Types Quiz with 96%',
      user: 'Devansh Patel',
      timestamp: '2 hours ago',
    },
    {
      id: 'act-5',
      type: 'Certificate Generated',
      description: 'earned Certificate of Excellence in UI/UX Design Systems',
      user: 'Sneha Gupta',
      timestamp: '4 hours ago',
    },
    {
      id: 'act-6',
      type: 'Credits Purchased',
      description: 'bought 1,500 Enterprise Platform Credits',
      user: 'Dr. Rajesh Varma',
      timestamp: '6 hours ago',
    },
    {
      id: 'act-7',
      type: 'Media Uploaded',
      description: 'uploaded 1.4GB 4K Lecture: Next.js Server Actions',
      user: 'Dr. Rajesh Varma',
      timestamp: '12 hours ago',
    },
  ];

  // Pending Items
  const pendingItems: PendingAssignmentItem[] = [
    {
      id: 'pend-1',
      title: 'React 19 Server Actions Deep-Dive Code Review',
      student: 'Vikram Malhotra',
      submitted: '2 hours ago',
      course: 'React 19 & Next.js 15 Masterclass',
      priority: 'Overdue',
      type: 'assignment',
    },
    {
      id: 'pend-2',
      title: 'Docker & Kubernetes Microservices Quiz - Short Answer Review',
      student: 'Meera Iyer',
      submitted: '3 hours ago',
      course: 'Full-Stack TypeScript & Node.js',
      priority: 'Due Soon',
      type: 'quiz_review',
    },
    {
      id: 'pend-3',
      title: 'Enterprise Master Certificate Approval Request',
      student: 'Aditya Sen',
      submitted: '5 hours ago',
      course: 'UI/UX & Design Systems Masterclass',
      priority: 'Normal',
      type: 'certificate_request',
    },
    {
      id: 'pend-4',
      title: 'Storage Capacity Alert: Exceeded 80% Allocation',
      student: 'System Monitoring',
      submitted: 'Just now',
      course: 'Global Academy Media Engine',
      priority: 'Due Soon',
      type: 'system_alert',
    },
  ];

  // Critical Dashboard Alerts
  const alerts: DashboardAlertItem[] = [
    {
      id: 'alert-1',
      severity: 'warning',
      title: '6 Assignments Awaiting Review',
      description: 'Students are expecting grades for recent submissions. Please review pending items.',
      timestamp: 'Updated 10m ago',
      primaryAction: { label: 'Review Submissions', href: '/courses' },
    },
  ];

  return {
    welcome,
    stats,
    coursePerformance,
    revenueTrendData,
    studentGrowthData,
    storageBreakdown,
    certificateStats,
    assignmentStats,
    quizStats,
    announcements,
    recentTransactions,
    recentActivities,
    pendingItems,
    alerts,
  };
};

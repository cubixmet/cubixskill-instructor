import { api } from '../../../lib/api';

export const DATA_SOURCE: 'mock' | 'api' = 'mock';

export const mockDashboardData = {
  welcome: {
    instructorName: "Dr. Rajesh Varma",
    role: "Senior Fullstack Instructor",
    academyName: "CubixSkill Academy",
    greeting: "Good morning, Rajesh",
    status: "Verified Academy",
    lastUpdated: "Just now",
  },
  stats: {
    totalRevenue: 1485000,
    totalSales: 1284,
    totalStudents: 1248,
    activeStudents: 890,
    totalCourses: 14,
    publishedCourses: 10,
    draftCourses: 3,
    pendingAssignments: 18,
    quizAttempts: 854,
    completionRate: 88.5,
    availableCredits: 12450,
    usedCreditsThisMonth: 3250,
    purchasedCredits: 20000,
    estimatedUpcomingCredits: 1700,
    mediaCreditsUsedThisMonth: 1280,
    totalMediaUploadedGB: 14.8,
    storageUsedGB: 14.8,
    storageTotalGB: 0,
  },
  revenueAnalytics: [
    { month: "Jan", revenue: 85000, students: 140 },
    { month: "Feb", revenue: 110000, students: 180 },
    { month: "Mar", revenue: 95000, students: 160 },
    { month: "Apr", revenue: 140000, students: 220 },
    { month: "May", revenue: 185000, students: 310 },
    { month: "Jun", revenue: 210000, students: 360 },
    { month: "Jul", revenue: 260000, students: 420 },
    { month: "Aug", revenue: 400000, students: 690 },
  ],
  enrollmentsTrend: [
    { date: "Mon", newStudents: 24, activeStudents: 180, completedStudents: 8 },
    { date: "Tue", newStudents: 32, activeStudents: 210, completedStudents: 12 },
    { date: "Wed", newStudents: 45, activeStudents: 290, completedStudents: 15 },
    { date: "Thu", newStudents: 38, activeStudents: 260, completedStudents: 10 },
    { date: "Fri", newStudents: 55, activeStudents: 340, completedStudents: 22 },
    { date: "Sat", newStudents: 68, activeStudents: 410, completedStudents: 30 },
    { date: "Sun", newStudents: 42, activeStudents: 310, completedStudents: 18 },
  ],
  topCourses: [
    {
      id: "c-1",
      title: "Fullstack React 19 & TypeScript Masterclass",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
      status: "Published",
      studentsCount: 1420,
      revenue: 2409518,
      completionRate: 92,
      rating: 4.9,
      creditsPerStudent: 17,
    },
    {
      id: "c-2",
      title: "Python Backend & FastAPI Microservices",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
      status: "Published",
      studentsCount: 890,
      revenue: 1184605,
      completionRate: 86,
      rating: 4.8,
      creditsPerStudent: 14,
    },
    {
      id: "c-3",
      title: "UI/UX Design Systems with Figma 2026",
      thumbnail: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60",
      status: "Draft",
      studentsCount: 0,
      revenue: 0,
      completionRate: 0,
      rating: 5.0,
      creditsPerStudent: 12,
    },
  ],
  recentOrders: [
    { id: "ORD-9821", student: "Aarav Patel", course: "Fullstack React 19 & TypeScript", amount: 3499, date: "10 mins ago", status: "Paid", paymentMethod: "Razorpay" },
    { id: "ORD-9820", student: "Priya Sharma", course: "Python Backend & FastAPI", amount: 2999, date: "35 mins ago", status: "Paid", paymentMethod: "Stripe" },
    { id: "ORD-9819", student: "Rohan Gupta", course: "Fullstack React 19 & TypeScript", amount: 3499, date: "1 hour ago", status: "Pending", paymentMethod: "Bank Transfer" },
    { id: "ORD-9818", student: "Ananya Sen", course: "UI/UX Design Systems with Figma", amount: 2499, date: "2 hours ago", status: "Paid", paymentMethod: "PayPal" },
    { id: "ORD-9817", student: "Vikram Patel", course: "Fullstack React 19 & TypeScript", amount: 3499, date: "4 hours ago", status: "Refunded", paymentMethod: "Razorpay" },
  ],
  recentEnrollments: [
    { id: "E-101", name: "Deepika Rao", avatar: "D", course: "Fullstack React 19", time: "12 mins ago", status: "Active", creditsDeducted: 17, paymentStatus: "Paid" },
    { id: "E-102", name: "Karan Malhotra", avatar: "K", course: "Python Backend & FastAPI", time: "45 mins ago", status: "Active", creditsDeducted: 14, paymentStatus: "Paid" },
    { id: "E-103", name: "Neha Joshi", avatar: "N", course: "Fullstack React 19", time: "2 hours ago", status: "Pending", creditsDeducted: 17, paymentStatus: "Pending" },
    { id: "E-104", name: "Siddharth Verma", avatar: "S", course: "UI/UX Design Systems", time: "3 hours ago", status: "Completed", creditsDeducted: 12, paymentStatus: "Paid" },
  ],
  pendingAssignments: [
    { id: "A-1", title: "State Management with Zustand & React Query", student: "Aarav Patel", submitted: "20 mins ago", course: "React 19", dueDate: "Today", priority: "Overdue", attemptNumber: 1 },
    { id: "A-2", title: "Building Framer Motion Micro-Animations", student: "Priya Sharma", submitted: "1 hour ago", course: "UI Design", dueDate: "Tomorrow", priority: "Due Soon", attemptNumber: 2 },
    { id: "A-3", title: "FastAPI REST JWT Authentication System", student: "Rohan Gupta", submitted: "3 hours ago", course: "Python Backend", dueDate: "In 3 days", priority: "Normal", attemptNumber: 1 },
  ],
  creditUsageBreakdown: [
    { category: "Base Student Credits", credits: 1600, percentage: 49.2 },
    { category: "HD Video Lessons", credits: 650, percentage: 20.0 },
    { category: "Quizzes & Question Banks", credits: 320, percentage: 9.8 },
    { category: "Assignment Grading", credits: 330, percentage: 10.2 },
    { category: "Certificates", credits: 250, percentage: 7.7 },
    { category: "Community & Chat", credits: 100, percentage: 3.1 },
  ],
  recentActivities: [
    { id: "act-1", type: "course_published", description: "Published new course 'Fullstack React 19 & TypeScript Masterclass'", actor: "Dr. Rajesh Varma", timestamp: "2 hours ago", link: "/courses/c-1" },
    { id: "act-2", type: "student_enrolled", description: "Aarav Patel enrolled in 'Fullstack React 19 & TypeScript'", actor: "Aarav Patel", timestamp: "4 hours ago", link: "/students/st-1" },
    { id: "act-3", type: "credits_purchased", description: "Purchased 5,000 Enterprise Credit Bundle", actor: "Billing Admin", timestamp: "Yesterday", link: "/credits/history" },
    { id: "act-4", type: "assignment_submitted", description: "Priya Sharma submitted assignment 'Framer Motion Animations'", actor: "Priya Sharma", timestamp: "Yesterday", link: "/assignments/A-2" },
  ],
  alerts: [
    { id: "al-1", severity: "warning", title: "Credit Balance Warning", description: "Your wallet balance (12,450 credits) is sufficient for approx 700 upcoming enrollments.", timestamp: "10m ago", primaryAction: { label: "Buy Credits", href: "/credits/buy" } },
    { id: "al-2", severity: "info", title: "Media Credit Usage", description: "You used 1,280 credits for media uploads this month.", timestamp: "1h ago", primaryAction: { label: "Manage Media", href: "/media" } },
  ],
  supportSummary: {
    openTickets: 2,
    inProgressTickets: 1,
    resolvedTickets: 18,
    avgResponseTime: "< 15 mins",
    liveChatAvailable: true,
  },
};

export const dashboardService = {
  async getDashboardSummary() {
    if (DATA_SOURCE === 'mock') {
      return mockDashboardData;
    }
    const response = await api.get('/api/v1/instructor/dashboard/summary/');
    return response.data;
  },
};

export interface User {
  id: string;
  fullName: string;
  academyName: string;
  email: string;
  phone: string;
  countryCode: string;
  role: string;
  avatarUrl?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceINR: number;
  popular?: boolean;
  bonusCredits?: number;
}

export interface CreditTransaction {
  id: string;
  date: string;
  type: 'purchase' | 'deduction' | 'refund' | 'admin_adjustment';
  amount: number;
  description: string;
  referenceId?: string;
  status: 'completed' | 'pending' | 'failed';
  invoiceUrl?: string;
}

export interface CreditUsageBreakdown {
  baseStudent: number;
  videoLessons: number;
  quizzes: number;
  assignments: number;
  certificate: number;
  community: number;
  totalPerStudent: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string;
  tags: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  language: string;
  thumbnail: string;
  promoVideoUrl?: string;
  instructorId: string;
  instructorName: string;
  isFree: boolean;
  priceINR: number;
  discountPriceINR?: number;
  status: 'Draft' | 'Pending Review' | 'Published' | 'Rejected' | 'Archived';
  studentsCount: number;
  rating: number;
  estimatedCreditsPerStudent: number;
  createdAt: string;
  updatedAt: string;
  features: {
    videoLessons: boolean;
    audioLessons: boolean;
    pdfLessons: boolean;
    fileLessons: boolean;
    externalUrls: boolean;
    quizzes: boolean;
    assignments: boolean;
    certificates: boolean;
    liveClasses: boolean;
    community: boolean;
    discussionForum: boolean;
    courseChat: boolean;
    downloads: boolean;
    notes: boolean;
    dripContent: boolean;
    sequentialLearning: boolean;
    manualApproval: boolean;
    completionReports: boolean;
  };
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'document' | 'text' | 'image' | 'download' | 'external_link' | 'embed' | 'quiz' | 'assignment' | 'live_class';
  durationMinutes: number;
  isPublished: boolean;
  isDemo: boolean;
  videoSource?: 'upload' | 'youtube' | 'vimeo' | 'bunny' | 's3' | 'cloudflare';
  videoUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  isCollapsed?: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  country: string;
  enrolledCoursesCount: number;
  completedCoursesCount?: number;
  progressPercent: number;
  creditsConsumed: number;
  lastActivity: string;
  status: 'Active' | 'Suspended' | 'Pending';
  avatarUrl?: string;
  enrolledCourses?: string[];
  batch?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'multi_select' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay' | 'matching' | 'ordering' | 'coding';
  questionText: string;
  options?: string[];
  correctAnswers?: string | string[];
  marks: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number;
  shuffleQuestions: boolean;
  autoGrading: boolean;
  questions: QuizQuestion[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  submissionType: 'text' | 'file' | 'url';
  content: string;
  fileUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  grade?: number;
  maxGrade: number;
  feedback?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  backgroundUrl: string;
  fontFamily: string;
  primaryColor: string;
  showQrCode: boolean;
  isDefault: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  department: string;
  roleId: string;
  roleName: string;
  status: 'Active' | 'Inactive';
  assignedCoursesCount: number;
  assignedStudentsCount: number;
  creditCost: number;
  lastActiveAt?: string;
  avatarUrl?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  creditCost: number;
  permissions: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean; publish: boolean; export: boolean; approve: boolean }>;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';
  createdAt: string;
  lastUpdated: string;
  studentName?: string;
  description: string;
}

export interface WebsiteSection {
  id: string;
  type: 'hero' | 'navbar' | 'courses' | 'features' | 'instructor' | 'testimonials' | 'faq' | 'cta' | 'footer';
  title: string;
  enabled: boolean;
  order: number;
  content: Record<string, any>;
}

export interface PaymentOrder {
  id: string;
  orderId: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amountINR: number;
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  paymentGateway: 'Razorpay' | 'Stripe' | 'PayPal' | 'Bank Transfer';
  date: string;
  invoiceUrl?: string;
}

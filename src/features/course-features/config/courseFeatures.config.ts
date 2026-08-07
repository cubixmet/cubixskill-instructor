import {
  Film,
  Headphones,
  FileText,
  Files,
  AlignLeft,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Code2,
  Radio,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  Shield,
  Award,
  Sliders,
  MessageSquare,
  MessageCircle,
  Clock,
  Lock,
  BarChart3,
  Globe,
  Sparkles,
} from 'lucide-react';

export type FeatureCategoryType =
  | 'Learning'
  | 'Media'
  | 'Assessment'
  | 'Certificates'
  | 'Engagement'
  | 'Learning Controls'
  | 'Reports'
  | 'Security'
  | 'Branding';

export interface SharedPlatformFeature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategoryType;
  creditCost: number;
  storageCostMB?: number;
  icon: any;
  isRecommended?: boolean;
  requiresConfig?: boolean;
  isPremium?: boolean;
  calculateCredits?: (studentCount: number) => number;
}

export const CENTRAL_PLATFORM_FEATURES: SharedPlatformFeature[] = [
  // LEARNING CONTENT
  {
    id: 'video_lessons',
    name: 'Video Lessons',
    category: 'Learning',
    description: 'Direct upload or external stream with custom player & HLS transcoding',
    creditCost: 1.5,
    storageCostMB: 500,
    icon: Film,
    isRecommended: true,
    requiresConfig: true,
    calculateCredits: (students) => Math.ceil(students * 1.5),
  },
  {
    id: 'audio_lessons',
    name: 'Audio Lessons',
    category: 'Learning',
    description: 'Audio stream player with transcript & speed controls',
    creditCost: 1.0,
    storageCostMB: 100,
    icon: Headphones,
    isRecommended: true,
    calculateCredits: (students) => Math.ceil(students * 1.0),
  },
  {
    id: 'pdf_lessons',
    name: 'PDF Lessons',
    category: 'Learning',
    description: 'Embedded PDF viewer with optional student download permissions',
    creditCost: 1.0,
    storageCostMB: 50,
    icon: FileText,
    isRecommended: true,
    calculateCredits: (students) => Math.ceil(students * 1.0),
  },
  {
    id: 'doc_lessons',
    name: 'Document Lessons',
    category: 'Learning',
    description: 'Rich text guides, markdown & HTML formatted articles',
    creditCost: 0.5,
    storageCostMB: 10,
    icon: Files,
    calculateCredits: (students) => Math.ceil(students * 0.5),
  },
  {
    id: 'text_lessons',
    name: 'Text Lessons',
    category: 'Learning',
    description: 'Short reading notes & code snippet blocks',
    creditCost: 0.5,
    icon: AlignLeft,
    calculateCredits: (students) => Math.ceil(students * 0.5),
  },
  {
    id: 'image_lessons',
    name: 'Image Lessons',
    category: 'Learning',
    description: 'High resolution infographics & image slide decks',
    creditCost: 0.5,
    storageCostMB: 20,
    icon: ImageIcon,
    calculateCredits: (students) => Math.ceil(students * 0.5),
  },
  {
    id: 'download_assets',
    name: 'Downloadable Resources',
    category: 'Learning',
    description: 'ZIP, worksheets, templates & source code attachments',
    creditCost: 1.0,
    storageCostMB: 200,
    icon: Download,
    isRecommended: true,
    calculateCredits: (students) => Math.ceil(students * 1.0),
  },
  {
    id: 'ext_url_lessons',
    name: 'External URL Resources',
    category: 'Learning',
    description: 'GitHub repos, Notion pages & web links',
    creditCost: 0.5,
    icon: ExternalLink,
    calculateCredits: (students) => Math.ceil(students * 0.5),
  },
  {
    id: 'interactive_lessons',
    name: 'Interactive Embeds',
    category: 'Learning',
    description: 'Embedded Figma, CodeSandbox & interactive iFrames',
    creditCost: 1.0,
    icon: Code2,
    calculateCredits: (students) => Math.ceil(students * 1.0),
  },
  {
    id: 'live_classes',
    name: 'Live Classes',
    category: 'Learning',
    description: 'Zoom, Google Meet & live webinar streaming integration',
    creditCost: 2.0,
    icon: Radio,
    calculateCredits: (students) => Math.ceil(students * 2.0),
  },

  // ASSESSMENTS
  {
    id: 'quizzes',
    name: 'Quizzes & OMR Assessments',
    category: 'Assessment',
    description: 'Interactive quiz assessments with auto-grading & OMR bulk upload',
    creditCost: 1.0,
    icon: HelpCircle,
    isRecommended: true,
    requiresConfig: true,
    calculateCredits: (students) => Math.ceil(students * 1.0),
  },
  {
    id: 'assignments',
    name: 'Assignments & Projects',
    category: 'Assessment',
    description: 'Project submissions with instructor evaluation & rubrics',
    creditCost: 1.0,
    storageCostMB: 100,
    icon: FileCheck,
    isRecommended: true,
    requiresConfig: true,
    calculateCredits: (students) => Math.ceil(students * 1.0),
  },
  {
    id: 'manual_assignment_review',
    name: 'Manual Assignment Review',
    category: 'Assessment',
    description: 'Rubric-based grading and instructor feedback workflow',
    creditCost: 0.5,
    icon: CheckCircle2,
    calculateCredits: (students) => Math.ceil(students * 0.5),
  },
  {
    id: 'coding_assignments',
    name: 'Coding Playground',
    category: 'Assessment',
    description: 'In-browser code editor & manual instructor review',
    creditCost: 2.0,
    icon: Code2,
    calculateCredits: (students) => Math.ceil(students * 2.0),
  },
  {
    id: 'exam_mode',
    name: 'Exam Mode Security',
    category: 'Security',
    description: 'Full-screen timed exams with auto submit & navigation locking',
    creditCost: 1.5,
    icon: Shield,
    calculateCredits: (students) => Math.ceil(students * 1.5),
  },

  // CERTIFICATES
  {
    id: 'certificates',
    name: 'CardFlow Certificates',
    category: 'Certificates',
    description: 'CardFlow dynamic certificates with automated QR verification',
    creditCost: 1.0,
    storageCostMB: 10,
    icon: Award,
    isRecommended: true,
    requiresConfig: true,
    calculateCredits: (students) => Math.ceil(students * 1.0),
  },
  {
    id: 'custom_cert_designer',
    name: 'Custom Certificate Designer',
    category: 'Certificates',
    description: 'CardFlow drag & drop canvas template builder',
    creditCost: 1.5,
    icon: Sliders,
    calculateCredits: (students) => Math.ceil(students * 1.5),
  },

  // ENGAGEMENT
  {
    id: 'course_forum',
    name: 'Course Discussion Forum',
    category: 'Engagement',
    description: 'Structured student Q&A discussion board & threaded posts',
    creditCost: 0.5,
    icon: MessageSquare,
    isRecommended: true,
    calculateCredits: (students) => Math.ceil(students * 0.5),
  },
  {
    id: 'course_chat',
    name: 'Course Cohort Chat',
    category: 'Engagement',
    description: 'Real-time cohort discussion room for active learners',
    creditCost: 1.0,
    icon: MessageCircle,
    calculateCredits: (students) => Math.ceil(students * 1.0),
  },

  // LEARNING CONTROLS
  {
    id: 'sequential_learning',
    name: 'Sequential Learning Guard',
    category: 'Learning Controls',
    description: 'Enforce linear step-by-step progress & locking',
    creditCost: 0.5,
    icon: Clock,
    isRecommended: true,
    requiresConfig: true,
    calculateCredits: (students) => Math.ceil(students * 0.5),
  },
  {
    id: 'lesson_locking',
    name: 'Lesson Locking',
    category: 'Learning Controls',
    description: 'Lock lessons until previous ones are completed',
    creditCost: 0.5,
    icon: Lock,
    calculateCredits: (students) => Math.ceil(students * 0.5),
  },

  // REPORTS & PREMIUM
  {
    id: 'student_reports',
    name: 'Student Reports',
    category: 'Reports',
    description: 'Individual student progress analytics & performance metrics',
    creditCost: 0.5,
    icon: BarChart3,
    calculateCredits: (students) => Math.ceil(students * 0.5),
  },
  {
    id: 'ai_features',
    name: 'AI Tutor & Quiz Assistant',
    category: 'Reports',
    description: 'AI-assisted quiz generation & automated student assistance',
    creditCost: 2.0,
    icon: Sparkles,
    isPremium: true,
    calculateCredits: (students) => Math.ceil(students * 2.0),
  },
  {
    id: 'custom_domain',
    name: 'Custom Domain & Branding',
    category: 'Branding',
    description: 'Host course on your custom white-label domain',
    creditCost: 3.0,
    icon: Globe,
    isPremium: true,
    calculateCredits: (students) => Math.ceil(students * 3.0),
  },
];

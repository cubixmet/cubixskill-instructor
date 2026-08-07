export type CourseFeatureCategory =
  | 'Learning Content'
  | 'Assessments'
  | 'Certificates'
  | 'Communication'
  | 'Live Learning'
  | 'Learning Controls'
  | 'Reports & Analytics'
  | 'Branding & Access'
  | 'Premium Features';

export interface CourseFeatureDefinition {
  id: string;
  name: string;
  description: string;
  category: CourseFeatureCategory;
  iconName: string;
  creditCostPerStudent: number;
  isRequired?: boolean;
  isRecommended?: boolean;
  isPremium?: boolean;
  dependencies?: string[];
  conflictingFeatures?: string[];
  settingsSchema?: string;
  relatedRoutes?: string[];
  relatedLessonTypes?: string[];
  relatedReportTypes?: string[];
}

export const COURSE_FEATURE_CATEGORIES: CourseFeatureCategory[] = [
  'Learning Content',
  'Assessments',
  'Certificates',
  'Communication',
  'Live Learning',
  'Learning Controls',
  'Reports & Analytics',
  'Branding & Access',
  'Premium Features',
];

export const COURSE_FEATURE_DEFINITIONS: CourseFeatureDefinition[] = [
  // 1. LEARNING CONTENT
  {
    id: 'videoLessons',
    name: 'Video Lessons',
    description: 'Host and stream high-definition video lessons with CDN playback.',
    category: 'Learning Content',
    iconName: 'Video',
    creditCostPerStudent: 2,
    isRequired: true,
    isRecommended: true,
    relatedLessonTypes: ['video'],
  },
  {
    id: 'audioLessons',
    name: 'Audio Lessons',
    description: 'Upload audio lectures and podcasts for students on the go.',
    category: 'Learning Content',
    iconName: 'Mic',
    creditCostPerStudent: 1,
    isRecommended: true,
    relatedLessonTypes: ['audio'],
  },
  {
    id: 'pdfLessons',
    name: 'PDF Lessons',
    description: 'Embed PDF documents and readable course materials.',
    category: 'Learning Content',
    iconName: 'FileText',
    creditCostPerStudent: 1,
    isRecommended: true,
    relatedLessonTypes: ['pdf'],
  },
  {
    id: 'docLessons',
    name: 'Document Lessons',
    description: 'Display rich docx and rich text lesson notes.',
    category: 'Learning Content',
    iconName: 'File',
    creditCostPerStudent: 1,
    relatedLessonTypes: ['doc'],
  },
  {
    id: 'downloadableAssets',
    name: 'Downloadable Assets',
    description: 'Attach zip files, datasets, and code starters for students.',
    category: 'Learning Content',
    iconName: 'Download',
    creditCostPerStudent: 1,
    isRecommended: true,
  },
  {
    id: 'externalUrlLessons',
    name: 'External URL Lessons',
    description: 'Link external web documentation and reference portals.',
    category: 'Learning Content',
    iconName: 'Link',
    creditCostPerStudent: 0,
    relatedLessonTypes: ['link'],
  },

  // 2. ASSESSMENTS
  {
    id: 'quizzes',
    name: 'Quizzes',
    description: 'Create interactive multiple-choice and single-choice quizzes.',
    category: 'Assessments',
    iconName: 'HelpCircle',
    creditCostPerStudent: 1,
    isRecommended: true,
    relatedRoutes: ['/quizzes'],
    relatedReportTypes: ['quizReports'],
  },
  {
    id: 'assignments',
    name: 'Assignments',
    description: 'Accept student project submissions with manual instructor grading.',
    category: 'Assessments',
    iconName: 'FileCheck',
    creditCostPerStudent: 1,
    isRecommended: true,
    relatedRoutes: ['/assignments'],
    relatedReportTypes: ['assignmentReports'],
  },
  {
    id: 'codingAssignments',
    name: 'Coding Assignments',
    description: 'Automated code runner and test-case grading suite.',
    category: 'Assessments',
    iconName: 'Code',
    creditCostPerStudent: 2,
    isPremium: true,
    dependencies: ['assignments'],
  },

  // 3. CERTIFICATES
  {
    id: 'certificates',
    name: 'Course Certificates',
    description: 'Issue official branded certificates upon course completion.',
    category: 'Certificates',
    iconName: 'Award',
    creditCostPerStudent: 1,
    isRecommended: true,
    relatedRoutes: ['/certificates'],
  },
  {
    id: 'qrVerification',
    name: 'QR Code Verification',
    description: 'Print scannable QR verification codes on student certificates.',
    category: 'Certificates',
    iconName: 'QrCode',
    creditCostPerStudent: 1,
    dependencies: ['certificates'],
  },
  {
    id: 'customCertificateBuilder',
    name: 'Custom Certificate Builder',
    description: 'Design custom certificate canvas templates with custom signatures.',
    category: 'Certificates',
    iconName: 'Sliders',
    creditCostPerStudent: 1,
    dependencies: ['certificates'],
  },

  // 4. COMMUNICATION
  {
    id: 'announcements',
    name: 'Course Announcements',
    description: 'Publish course updates, schedule notices, and email alerts.',
    category: 'Communication',
    iconName: 'Megaphone',
    creditCostPerStudent: 1,
    isRecommended: true,
    relatedRoutes: ['/announcements'],
  },
  {
    id: 'communityDiscussion',
    name: 'Community Discussions',
    description: 'Host private course forum topics and student Q&A threads.',
    category: 'Communication',
    iconName: 'MessageSquare',
    creditCostPerStudent: 1,
    isRecommended: true,
    relatedRoutes: ['/discussions'],
  },
  {
    id: 'personalChat',
    name: 'Personal Chat',
    description: '1-on-1 private messaging channel between student and instructor.',
    category: 'Communication',
    iconName: 'MessageCircle',
    creditCostPerStudent: 1,
    relatedRoutes: ['/discussions'],
  },

  // 5. LIVE LEARNING
  {
    id: 'liveSessions',
    name: 'Live Sessions',
    description: 'Schedule Zoom, Google Meet, Teams, and virtual classroom webinars.',
    category: 'Live Learning',
    iconName: 'Radio',
    creditCostPerStudent: 2,
    isRecommended: true,
    relatedRoutes: ['/live-sessions', '/live-classroom'],
  },
  {
    id: 'liveClassroom',
    name: 'In-Platform Live Classroom',
    description: 'Conduct live webinars inside CubixSkill platform UI.',
    category: 'Live Learning',
    iconName: 'Video',
    creditCostPerStudent: 1,
    dependencies: ['liveSessions'],
  },
  {
    id: 'sessionRecordings',
    name: 'Session Recordings',
    description: 'Archive and stream recorded live webinars for students.',
    category: 'Live Learning',
    iconName: 'Clock',
    creditCostPerStudent: 1,
    dependencies: ['liveSessions'],
  },

  // 6. LEARNING CONTROLS
  {
    id: 'sequentialLearning',
    name: 'Sequential Learning',
    description: 'Enforce chronological lesson progression.',
    category: 'Learning Controls',
    iconName: 'Lock',
    creditCostPerStudent: 0,
    isRecommended: true,
  },
  {
    id: 'videoCompletionRequirement',
    name: 'Video Completion Gate',
    description: 'Require students to watch minimum video percentage to unlock next lesson.',
    category: 'Learning Controls',
    iconName: 'Eye',
    creditCostPerStudent: 0,
    settingsSchema: 'video_completion',
  },

  // 7. REPORTS & ANALYTICS
  {
    id: 'studentReports',
    name: 'Student Analytics Reports',
    description: 'Track individual student progress, engagement, and scores.',
    category: 'Reports & Analytics',
    iconName: 'Users',
    creditCostPerStudent: 1,
    isRecommended: true,
    relatedRoutes: ['/reports'],
  },
  {
    id: 'quizReports',
    name: 'Quiz Performance Reports',
    description: 'Analyze question difficulty and cohort pass rates.',
    category: 'Reports & Analytics',
    iconName: 'TrendingUp',
    creditCostPerStudent: 0,
    dependencies: ['quizzes'],
  },

  // 8. BRANDING & ACCESS
  {
    id: 'whiteLabel',
    name: 'White Label Branding',
    description: 'Remove CubixSkill branding badges from player and certificates.',
    category: 'Branding & Access',
    iconName: 'Globe',
    creditCostPerStudent: 2,
    isPremium: true,
  },
  {
    id: 'apiAccess',
    name: 'REST API & Webhooks',
    description: 'Integrate external CRM, Zapier, and custom webhooks.',
    category: 'Branding & Access',
    iconName: 'Key',
    creditCostPerStudent: 2,
    isPremium: true,
  },
];

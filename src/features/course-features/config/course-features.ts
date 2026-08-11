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
  'Certificates',
  'Communication',
  'Live Learning',
  'Assessments',
  'Learning Controls',
];

export const COURSE_FEATURE_DEFINITIONS: CourseFeatureDefinition[] = [
  {
    id: 'lessons',
    name: 'Lessons',
    description: 'Create and manage structured lessons for this course.',
    category: 'Learning Content',
    iconName: 'BookOpen',
    creditCostPerStudent: 1,
    isRequired: true,
    isRecommended: true,
  },
  {
    id: 'courseCertificates',
    name: 'Certificates',
    description: 'Generate completion certificates for the course.',
    category: 'Certificates',
    iconName: 'Award',
    creditCostPerStudent: 1,
    isRecommended: true,
    relatedRoutes: ['/certificates'],
  },
  {
    id: 'personalChat',
    name: 'One-to-One Direct Chat',
    description: 'Private messaging between students and assigned instructors/TAs.',
    category: 'Communication',
    iconName: 'MessageCircle',
    creditCostPerStudent: 1,
    relatedRoutes: ['/discussions'],
  },
  {
    id: 'courseDiscussion',
    name: 'Community Discussions',
    description: 'Course discussions and Q&A for enrolled students.',
    category: 'Communication',
    iconName: 'MessageSquare',
    creditCostPerStudent: 1,
    isRecommended: true,
    relatedRoutes: ['/discussions'],
  },
  {
    id: 'liveSessions',
    name: 'Live Classes',
    description: 'Schedule live interactive classes for the course.',
    category: 'Live Learning',
    iconName: 'Radio',
    creditCostPerStudent: 2,
    isRecommended: true,
    relatedRoutes: ['/live-sessions', '/live-classroom'],
  },
  {
    id: 'quizzes',
    name: 'Assessments & Quizzes',
    description: 'Enable supported assessments, assignments and quizzes.',
    category: 'Assessments',
    iconName: 'FileCheck',
    creditCostPerStudent: 2,
    isRecommended: true,
    relatedRoutes: ['/quizzes', '/assignments'],
  },
  {
    id: 'sequentialLearning',
    name: 'Progress Controls & Locking',
    description: 'Control lesson access, progression, completion rules and student progress reporting.',
    category: 'Learning Controls',
    iconName: 'Lock',
    creditCostPerStudent: 1,
    isRecommended: true,
  },
  {
    id: 'feeCollection',
    name: 'Fee Collection',
    description: 'Collect and manage course-related student fees.',
    category: 'Learning Content',
    iconName: 'DollarSign',
    creditCostPerStudent: 1,
    isRecommended: true,
  },
];

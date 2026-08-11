import {
  CreditConfig,
  CreditCalculationResult,
  CreditBreakdownItem,
} from '../types/credit.types';

export const DEFAULT_COURSE_CREDIT_CONFIG: CreditConfig = {
  baseCourseCredits: 10,
  features: {
    lessons: {
      featureId: 'lessons',
      name: 'Lessons',
      creditCost: 1,
      description: 'Create and manage structured lessons',
    },
    certificates: {
      featureId: 'certificates',
      name: 'Certificates',
      creditCost: 2,
      description: 'Automated completion certificates',
    },
    chat_one_on_one: {
      featureId: 'chat_one_on_one',
      name: 'One-to-One Direct Chat',
      creditCost: 3,
      description: 'Direct messaging between student & instructor',
    },
    community_chat: {
      featureId: 'community_chat',
      name: 'Community Discussions',
      creditCost: 2,
      description: 'Course discussion forum',
    },
    live_classes: {
      featureId: 'live_classes',
      name: 'Live Classes',
      creditCost: 3,
      description: 'Interactive video streams & webinars',
    },
    quizzes: {
      featureId: 'quizzes',
      name: 'Assessments & Quizzes',
      creditCost: 2,
      description: 'Graded quizzes & assignments',
    },
    progress_controls: {
      featureId: 'progress_controls',
      name: 'Progress Controls & Locking',
      creditCost: 1,
      description: 'Sequential lesson unlocking & progress reports',
    },
    fee_collection: {
      featureId: 'fee_collection',
      name: 'Fee Collection',
      creditCost: 0,
      description: 'Course-related student fee management',
    },
  },
};

/**
 * Calculates per-student credit costs based on selected feature IDs
 */
export const calculateCourseCredits = (
  selectedFeatureIds: string[],
  config: CreditConfig = DEFAULT_COURSE_CREDIT_CONFIG
): CreditCalculationResult => {
  const baseCredits = Math.max(0, config.baseCourseCredits || 10);
  const breakdown: CreditBreakdownItem[] = [
    {
      id: 'base_course',
      name: 'Base Course',
      creditCost: baseCredits,
      isBase: true,
    },
  ];

  let featureCredits = 0;

  selectedFeatureIds.forEach((id) => {
    const rule = config.features[id];
    if (rule) {
      const cost = Math.max(0, Number(rule.creditCost) || 0);
      featureCredits += cost;
      breakdown.push({
        id: rule.featureId,
        name: rule.name,
        creditCost: cost,
      });
    }
  });

  return {
    baseCredits,
    featureCredits,
    totalCreditsPerStudent: baseCredits + featureCredits,
    breakdown,
  };
};

/**
 * Asynchronous credit config service helper (backend API ready)
 */
export const getCourseCreditConfig = async (): Promise<CreditConfig> => {
  // Simulates backend API latency if needed in testing
  return DEFAULT_COURSE_CREDIT_CONFIG;
};

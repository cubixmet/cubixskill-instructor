import type { CalculatorFeature, FeatureCategoryName } from './types';
import { CENTRAL_PLATFORM_FEATURES } from '../../../features/course-features/config/courseFeatures.config';

export const CATEGORIES: FeatureCategoryName[] = [
  'Learning Content',
  'Assessments',
  'Certificates',
  'Engagement',
  'Learning Controls',
];

export const CATEGORY_ORDER: Record<string, number> = {
  'Learning Content': 1,
  'Assessments': 2,
  'Certificates': 3,
  'Engagement': 4,
  'Learning Controls': 5,
};

// Map Central Single Source of Truth Features to Calculator Format
export const ALL_FEATURES: CalculatorFeature[] = CENTRAL_PLATFORM_FEATURES.map((feat, index) => {
  const categoryKeyMap: Record<string, any> = {
    Learning: 'learning-content',
    Assessment: 'assessments',
    Certificates: 'certificates',
    Engagement: 'engagement',
    'Learning Controls': 'learning-controls',
    Reports: 'learning-controls',
    Security: 'assessments',
    Branding: 'learning-content',
  };

  const categoryNameMap: Record<string, FeatureCategoryName> = {
    Learning: 'Learning Content',
    Assessment: 'Assessments',
    Certificates: 'Certificates',
    Engagement: 'Engagement',
    'Learning Controls': 'Learning Controls',
    Reports: 'Learning Controls',
    Security: 'Assessments',
    Branding: 'Learning Content',
  };

  return {
    id: feat.id,
    name: feat.name,
    description: feat.description,
    category: categoryNameMap[feat.category] || 'Learning Content',
    categoryKey: categoryKeyMap[feat.category] || 'learning-content',
    sortOrder: index + 1,
    icon: feat.icon,
    creditCost: feat.creditCost,
    recommended: feat.isRecommended || false,
    isConfigurable: feat.requiresConfig || false,
  };
});

export const getSortedFeatures = (features: CalculatorFeature[]) => {
  return [...features].sort((a, b) => a.sortOrder - b.sortOrder);
};

import type { LucideIcon } from 'lucide-react';

export type FeatureCategoryName =
  | 'Learning Content'
  | 'Assessments'
  | 'Certificates'
  | 'Engagement'
  | 'Learning Controls';

export interface CalculatorFeature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategoryName;
  categoryKey?: string;
  sortOrder: number;
  icon: LucideIcon;
  creditCost: number;
  isRequired?: boolean;
  isPremium?: boolean;
  isConfigurable?: boolean;
  recommended?: boolean;
}

export interface CreditCalculationBreakdownItem {
  featureId: string;
  name: string;
  category: FeatureCategoryName;
  costPerStudent: number;
  totalCostForStudents: number;
}

export interface CalculationResult {
  baseCreditPerStudent: number;
  selectedFeaturesCreditPerStudent: number;
  totalCreditPerStudent: number;
  studentCount: number;
  totalRequiredCredits: number;
  availableBalance: number;
  remainingBalance: number;
  shortageCredits: number;
  status: 'healthy' | 'low' | 'insufficient';
  breakdownList: CreditCalculationBreakdownItem[];
}

export interface CreditCalculatorProps {
  initialEnrolledCount?: number;
  availableBalance?: number;
  courseTitle?: string;
  onSelectPackage?: (creditsNeeded?: number) => void;
  onConfirmEnrollment?: (details: {
    studentCount: number;
    totalCredits: number;
    remainingBalance: number;
  }) => void;
}

export interface FeatureCreditRule {
  featureId: string;
  name: string;
  creditCost: number;
  description?: string;
}

export interface CreditConfig {
  baseCourseCredits: number;
  features: Record<string, FeatureCreditRule>;
}

export interface CreditBreakdownItem {
  id: string;
  name: string;
  creditCost: number;
  isBase?: boolean;
}

export interface CreditCalculationResult {
  baseCredits: number;
  featureCredits: number;
  totalCreditsPerStudent: number;
  breakdown: CreditBreakdownItem[];
}

import { apiClient } from '../../../api/client';
import type { CreditConfig, CreditCalculationResult } from '../types/credit.types';

export const MISSING_BACKEND_FIELD = "MISSING_BACKEND_FIELD: Course-specific credit pricing is not provided by backend";

export const DEFAULT_COURSE_CREDIT_CONFIG: CreditConfig = {
  baseCourseCredits: 0,
  features: {},
};

export const calculateCourseCredits = (selectedFeatureIds: string[]): CreditCalculationResult => {
  return {
    baseCredits: 0,
    featureCredits: 0,
    totalCreditsPerStudent: 0,
    breakdown: [],
  };
};

export const getCourseCreditConfig = async (): Promise<CreditConfig> => {
  return DEFAULT_COURSE_CREDIT_CONFIG;
};

export interface CreditBalanceInfo {
  balance: string;
  currency_unit: string;
  notice: string;
}

export const getCourseCreditInfo = async (): Promise<CreditBalanceInfo> => {
  try {
    const res = await apiClient.get<any>("/api/v1/credits/credits/balance/");
    const balanceData = res.data?.data || res.data;
    return {
      balance: balanceData?.balance || "0.00",
      currency_unit: balanceData?.currency_unit || "CREDITS",
      notice: MISSING_BACKEND_FIELD,
    };
  } catch (err) {
    return {
      balance: "0.00",
      currency_unit: "CREDITS",
      notice: MISSING_BACKEND_FIELD,
    };
  }
};



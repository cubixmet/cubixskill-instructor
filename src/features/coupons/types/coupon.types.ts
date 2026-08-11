export type DiscountType = 'percentage' | 'fixed';

export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface CouponEntity {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  currency: string; // 'INR', 'USD', etc.
  courseScope: 'all' | string; // 'all' or courseUuid
  courseTitle?: string;
  validFrom?: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD
  usageLimit?: number | null; // null or number > 0 for limited usage
  perStudentLimit?: number; // default 1
  usageCount: number;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CouponFormData {
  code: string;
  discountType: DiscountType;
  discountValue: number | '';
  currency: string;
  courseScope: 'all' | string;
  validFrom: string;
  expiryDate: string;
  usageLimit: number | '' | null;
  perStudentLimit: number | '';
  status: 'active' | 'inactive';
}

export interface CouponFormErrors {
  code?: string;
  discountType?: string;
  discountValue?: string;
  currency?: string;
  courseScope?: string;
  validFrom?: string;
  expiryDate?: string;
  usageLimit?: string;
  perStudentLimit?: string;
  status?: string;
}

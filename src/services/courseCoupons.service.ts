import apiClient from '../api/client';

export interface CouponItem {
  id: string;
  code: string;
  name: string;
  description: string;
  scope: string;
  academy_id?: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  max_discount_amount?: number | null;
  minimum_order_amount: number;
  valid_from: string;
  valid_until?: string | null;
  total_usage_limit: number;
  per_user_usage_limit: number;
  current_usage_count: number;
  first_purchase_only: boolean;
  is_active: boolean;
  computed_status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SCHEDULED' | 'USAGE_LIMIT_REACHED';
  courses_ids: string[];
  created_at: string;
}

export interface CouponRedemptionItem {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_code: string;
  avatar_url?: string | null;
  order_number: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  redeemed_at: string;
  status: string;
}

export interface CreateCouponPayload {
  code: string;
  name: string;
  description?: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  max_discount_amount?: number | null;
  minimum_order_amount?: number;
  valid_from?: string;
  valid_until?: string | null;
  total_usage_limit?: number;
  per_user_usage_limit?: number;
  first_purchase_only?: boolean;
  is_active?: boolean;
}

export const courseCouponsService = {
  async list(courseUuid: string, params?: { search?: string; status?: string }): Promise<CouponItem[]> {
    const cleanParams: Record<string, string> = {};
    if (params?.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params?.status && params.status !== 'all') {
      cleanParams.status = params.status;
    }
    const res = await apiClient.get(`/api/v1/payments/courses/${courseUuid}/coupons/`, { params: cleanParams });
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data) as CouponItem[];
  },

  async get(courseUuid: string, couponId: string): Promise<CouponItem> {
    const res = await apiClient.get(`/api/v1/payments/courses/${courseUuid}/coupons/${couponId}/`);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data) as CouponItem;
  },

  async create(courseUuid: string, payload: CreateCouponPayload): Promise<CouponItem> {
    const res = await apiClient.post(`/api/v1/payments/courses/${courseUuid}/coupons/`, payload);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data) as CouponItem;
  },

  async update(courseUuid: string, couponId: string, payload: Partial<CreateCouponPayload>): Promise<CouponItem> {
    const res = await apiClient.patch(`/api/v1/payments/courses/${courseUuid}/coupons/${couponId}/`, payload);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data) as CouponItem;
  },

  async toggleStatus(courseUuid: string, couponId: string): Promise<CouponItem> {
    const res = await apiClient.post(`/api/v1/payments/courses/${courseUuid}/coupons/${couponId}/deactivate/`);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data) as CouponItem;
  },

  async delete(courseUuid: string, couponId: string): Promise<void> {
    await apiClient.delete(`/api/v1/payments/courses/${courseUuid}/coupons/${couponId}/`);
  },

  async generateCode(courseUuid: string): Promise<string> {
    const res = await apiClient.get(`/api/v1/payments/courses/${courseUuid}/coupons/generate-code/`);
    const data = res.data;
    const body = data && typeof data === 'object' && 'data' in data ? data.data : data;
    return body?.code || 'WELCOME10';
  },

  async getRedemptions(courseUuid: string, couponId: string): Promise<CouponRedemptionItem[]> {
    const res = await apiClient.get(`/api/v1/payments/courses/${courseUuid}/coupons/${couponId}/redemptions/`);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data) as CouponRedemptionItem[];
  },

  async validate(courseUuid: string, payload: { coupon_code: string; subtotal_amount: number }): Promise<{ valid: boolean; discount: number; total: number; message?: string }> {
    const res = await apiClient.post(`/api/v1/payments/courses/${courseUuid}/coupons/validate/`, {
      coupon_code: payload.coupon_code,
      course_id: courseUuid,
    });
    const data = res.data;
    const body = data && typeof data === 'object' && 'data' in data ? data.data : data;
    return {
      valid: Boolean(body?.valid),
      discount: parseFloat(body?.discount || '0'),
      total: parseFloat(body?.total || '0'),
    };
  },
};

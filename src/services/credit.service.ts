import apiClient from '../api/client';

export interface EstimatedUsageItem {
  code: string;
  name: string;
  detail: string;
  credits: string;
  quantity: number;
  unit: string;
}

export interface StorageBreakdownSummary {
  current_storage_bytes: number;
  current_storage_gb: string;
  monthly_average_bytes: number;
  monthly_average_gb: string;
  free_storage_bytes: number;
  free_storage_gb: string;
  billable_storage_gb: string;
  credit_rate_per_gb: string;
  estimated_storage_charge: string;
  billing_interval_label?: string;
}

export interface MonthlyInvoiceLineItem {
  id: string;
  item_type: string;
  feature_code: string;
  description: string;
  quantity: string;
  unit: string;
  rate: string;
  credits: string;
}

export interface MonthlyInvoiceRecord {
  id: string;
  billing_period: string;
  billing_period_label: string;
  total_credits: string;
  status: string;
  generated_at: string;
  finalized_at: string;
  line_items: MonthlyInvoiceLineItem[];
}

export interface CreditSummaryData {
  balance: string;
  currency_unit: string;
  total_credited: string;
  total_debited: string;
  credited_this_month: string;
  debited_this_month: string;
  storage_usage_credits_this_month: string;
  email_usage_credits_this_month: string;
  is_low_balance: boolean;
  low_balance_threshold: string;
  this_month_estimated_total?: string;
  estimated_breakdown?: EstimatedUsageItem[];
  storage_breakdown?: StorageBreakdownSummary;
  rates?: Record<string, { name: string; billing_type: string; unit_size: string; credit_cost: string }>;
}

export interface CreditLedgerItem {
  id: string;
  entry_type: 'CREDIT' | 'DEBIT';
  source_type: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  reference_type: string;
  reference_id: string;
  idempotency_key: string;
  description: string;
  metadata: Record<string, any>;
  created_by_email?: string;
  occurred_at: string;
}

export interface CreditUsageItem {
  source_type: string;
  label: string;
  credits_used: string;
}

export interface CreditUsagePreviewResponse {
  billable: boolean;
  billing_type: 'PER_DAY' | string;
  daily_credit_cost: string;
  current_balance: string;
  current_daily_usage: string;
  additional_daily_cost: string;
  projected_daily_usage: string;
  estimated_days_remaining: number | null;
  first_charge: string;
  next_charge_date: string;
  has_enough_credits: boolean;
  already_active?: boolean;
}

export interface CreditActivateUsageResponse {
  success: boolean;
  already_charged: boolean;
  subscription_id: string;
  resource_type: string;
  resource_id: string;
  billing_type: string;
  daily_credit_cost: string;
  wallet_balance: string;
  next_charge_date?: string;
}

export interface CreditPurchaseRateItem {
  id: string;
  feature_key: string;
  name: string;
  description: string;
  billing_type: string;
  unit_size: string;
  credit_cost: string;
  price: string;
  credits: string;
  currency: string;
  is_purchasable: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CreditPurchaseRecord {
  id: string;
  rate?: string;
  rate_name?: string;
  package?: string;
  package_name?: string;
  coupon?: string;
  coupon_code: string;
  base_credits: string;
  bonus_credits: string;
  total_credits: string;
  original_price: string;
  discount_amount: string;
  final_price: string;
  currency: string;
  payment_order_id: string;
  payment_transaction_id: string;
  status: string;
  fulfilled_at?: string;
  created_at: string;
}

let pendingSummaryPromise: Promise<CreditSummaryData> | null = null;

export const creditService = {
  async getSummary(): Promise<CreditSummaryData> {
    if (pendingSummaryPromise) {
      return pendingSummaryPromise;
    }
    pendingSummaryPromise = apiClient.get('/api/v1/credits/summary/')
      .then((res) => res.data)
      .finally(() => {
        setTimeout(() => {
          pendingSummaryPromise = null;
        }, 2000);
      });
    return pendingSummaryPromise;
  },

  async getTransactions(params?: {
    entry_type?: string;
    source_type?: string;
    page?: number;
  }): Promise<{ results: CreditLedgerItem[]; count: number }> {
    const res = await apiClient.get('/api/v1/credits/transactions/', { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { results: data, count: data.length };
    }
    return { results: data.results || [], count: data.count || 0 };
  },

  async getUsage(): Promise<{ usage: CreditUsageItem[] }> {
    const res = await apiClient.get('/api/v1/credits/usage/');
    return res.data;
  },

  async getUsagePreview(payload: {
    feature_code?: string;
    resource_type?: string;
    resource_id?: string;
    course_id?: string;
  }): Promise<any> {
    const res = await apiClient.post('/api/v1/credits/usage-preview/', payload);
    return res.data?.data || res.data;
  },

  async activateUsage(payload: {
    resource_type: string;
    resource_id: string;
    course_id?: string;
  }): Promise<CreditActivateUsageResponse> {
    const res = await apiClient.post('/api/v1/credits/activate-usage/', payload);
    return res.data?.data || res.data;
  },

  async getPurchaseRates(): Promise<CreditPurchaseRateItem[]> {
    const res = await apiClient.get('/api/v1/credits/purchase-rates/');
    const data = res.data;
    if (Array.isArray(data)) return data;
    return data.results || [];
  },

  async getPackages(): Promise<CreditPurchaseRateItem[]> {
    return this.getPurchaseRates();
  },

  async previewPurchase(rateId: string, couponCode?: string): Promise<{
    valid: boolean;
    rate_id: string;
    coupon_code: string;
    description: string;
    discount_amount: string;
    original_price: string;
    final_price: string;
    total_credits: string;
    credits: string;
    bonus_credits: string;
    currency: string;
  }> {
    const res = await apiClient.post('/api/v1/credits/purchases/purchase-preview/', {
      rate_id: rateId,
      coupon_code: couponCode || '',
    });
    return res.data;
  },

  async createPurchase(rateId: string, couponCode?: string): Promise<CreditPurchaseRecord & {
    razorpay_order_id?: string;
    key_id?: string;
    gateway_data?: any;
    customer?: {
      name?: string;
      email?: string;
      contact?: string;
    };
  }> {
    const res = await apiClient.post('/api/v1/credits/purchases/create-order/', {
      rate_id: rateId,
      coupon_code: couponCode || '',
    });
    return res.data;
  },

  async verifyPurchase(
    purchaseId: string,
    payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
  ): Promise<CreditPurchaseRecord> {
    const res = await apiClient.post(`/api/v1/credits/purchases/${purchaseId}/verify/`, payload);
    return res.data?.purchase || res.data;
  },

  async fulfillPurchase(purchaseId: string, paymentTransactionId?: string): Promise<CreditPurchaseRecord> {
    const res = await apiClient.post(`/api/v1/credits/purchases/${purchaseId}/fulfill/`, {
      payment_transaction_id: paymentTransactionId || '',
    });
    return res.data?.purchase || res.data;
  },

  async getMonthlyInvoices(): Promise<MonthlyInvoiceRecord[]> {
    const res = await apiClient.get('/api/v1/credits/monthly/invoices/');
    const data = res.data;
    if (Array.isArray(data)) return data;
    return data.results || [];
  },
};


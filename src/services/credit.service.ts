import apiClient from '../api/client';

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

export interface CreditPackageItem {
  id: string;
  name: string;
  description: string;
  credits: string;
  price: string;
  currency: string;
  bonus_credits: string;
  popular: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface CreditPurchaseRecord {
  id: string;
  package?: string;
  package_name: string;
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

export const creditService = {
  async getSummary(): Promise<CreditSummaryData> {
    const res = await apiClient.get('/api/v1/credits/summary/');
    return res.data;
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

  async getPackages(): Promise<CreditPackageItem[]> {
    const res = await apiClient.get('/api/v1/credits/packages/');
    return Array.isArray(res.data) ? res.data : [];
  },

  async previewPurchase(packageId: string, couponCode?: string): Promise<{
    valid: boolean;
    package_id: string;
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
      package_id: packageId,
      coupon_code: couponCode || '',
    });
    return res.data;
  },

  async createPurchase(packageId: string, couponCode?: string): Promise<CreditPurchaseRecord> {
    const res = await apiClient.post('/api/v1/credits/purchases/create-order/', {
      package_id: packageId,
      coupon_code: couponCode || '',
    });
    return res.data;
  },

  async fulfillPurchase(purchaseId: string, paymentTransactionId?: string): Promise<CreditPurchaseRecord> {
    const res = await apiClient.post(`/api/v1/credits/purchases/${purchaseId}/fulfill/`, {
      payment_transaction_id: paymentTransactionId || '',
    });
    return res.data?.purchase || res.data;
  },
};

import apiClient from '../api/client';

export type PaymentMode = 'ACADEMY_RAZORPAY' | 'CUBIXSKILL_RAZORPAY';

export interface PaymentSettingsData {
  id?: string;
  payment_mode: PaymentMode;
  razorpay_key_id?: string;
  razorpay_environment?: 'test' | 'live';
  credentials_configured?: boolean;
  credentials_verified?: boolean;
  settlement_method?: 'UPI' | 'BANK_TRANSFER' | 'ROUTE';
  beneficiary_name?: string;
  razorpay_linked_account_id?: string;
  settlement_enabled?: boolean;
  kyc_status?: string;
  key_secret_preview?: string;
  webhook_secret_preview?: string;
  settlement_vpa_preview?: string;
  settlement_account_preview?: string;

  // Write-only payload fields
  razorpay_key_secret?: string;
  razorpay_webhook_secret?: string;
  settlement_vpa?: string;
  settlement_account?: string;
  settlement_ifsc?: string;
}

export interface PaymentTransactionItem {
  id: string;
  uuid: string;
  payment_mode: PaymentMode;
  gateway: string;
  payment_method: string;
  gateway_payment_id: string;
  gateway_order_id: string;
  amount: string | number;
  currency: string;
  gross_amount: string | number;
  platform_fee: string | number;
  gateway_fee: string | number;
  tax_amount: string | number;
  academy_amount: string | number;
  status: 'CREATED' | 'PENDING' | 'AUTHORIZED' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  signature_verified: boolean;
  webhook_verified: boolean;
  paid_at?: string;
  initiated_at: string;
  payer_email?: string;
  course_title?: string;
}

export interface AcademySettlementItem {
  id: string;
  uuid: string;
  academy_name: string;
  period_start?: string;
  period_end?: string;
  gross_amount: string | number;
  refund_amount: string | number;
  gateway_fee: string | number;
  platform_fee: string | number;
  tax_amount: string | number;
  net_amount: string | number;
  settlement_method: string;
  provider: string;
  provider_transfer_id?: string;
  provider_payout_id?: string;
  status: 'PENDING' | 'READY' | 'PROCESSING' | 'ON_HOLD' | 'PAID' | 'FAILED' | 'REVERSED';
  failure_reason?: string;
  initiated_at?: string;
  processed_at?: string;
  settled_at?: string;
  created_at: string;
}

export const paymentSettingsService = {
  async getPaymentSettings(): Promise<PaymentSettingsData> {
    const res = await apiClient.get('/api/v1/payments/settings/');
    return res.data.data || res.data;
  },

  async updatePaymentSettings(payload: Partial<PaymentSettingsData>): Promise<PaymentSettingsData> {
    const res = await apiClient.patch('/api/v1/payments/settings/', payload);
    return res.data.data || res.data;
  },

  async verifyRazorpay(): Promise<{ verified: boolean }> {
    const res = await apiClient.post('/api/v1/payments/settings/verify-razorpay/');
    return res.data.data || res.data;
  },

  async disconnectRazorpay(): Promise<void> {
    await apiClient.delete('/api/v1/payments/settings/academy-razorpay/');
  },

  async getTransactions(): Promise<PaymentTransactionItem[]> {
    const res = await apiClient.get('/api/v1/payments/academy/payments/');
    const data = res.data.results || res.data.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  async getSettlements(): Promise<AcademySettlementItem[]> {
    const res = await apiClient.get('/api/v1/payments/settlements/');
    const data = res.data.results || res.data.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  async refundTransaction(transactionUuid: string, amount: number, reason: string): Promise<any> {
    const res = await apiClient.post(`/api/v1/payments/transactions/${transactionUuid}/refund/`, {
      amount,
      reason,
    });
    return res.data;
  },
};

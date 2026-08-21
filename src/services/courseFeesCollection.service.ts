import apiClient from '../api/client';

export interface CourseFeeSummary {
  course_id: string;
  course_title: string;
  total_students: number;
  configured_students: number;
  total_expected: number;
  total_collected: number;
  outstanding_balance: number;
  overdue_amount: number;
  paid_count: number;
  partial_count: number;
  pending_count: number;
  overdue_count: number;
  not_configured_count: number;
  currency: string;
}

export interface StudentFeeRecordItem {
  student_id: string;
  student_code: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  avatar_url: string;
  fee_account_id: string | null;
  plan_type: string;
  total_fee: number;
  effective_fee: number;
  paid_amount: number;
  balance: number;
  next_due_date: string | null;
  overdue_amount: number;
  status: string;
  currency: string;
}

export interface FeeInstallmentItem {
  id: string;
  sequence: number;
  label: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  waived_amount: number;
  remaining_amount: number;
  status: string;
}

export interface FeePaymentItem {
  id: string;
  receipt_number: string;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  notes?: string;
  recorded_by: string;
}

export interface FeeAdjustmentItem {
  id: string;
  adjustment_type: string;
  amount: number;
  reason: string;
  authorized_by: string;
  created_at: string;
}

export interface StudentFeeAccountDetail {
  fee_account_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_code: string;
  course_id: string;
  course_title: string;
  plan_type: string;
  currency: string;
  total_fee_amount: number;
  effective_fee_amount: number;
  total_paid: number;
  balance: number;
  status: string;
  installments: FeeInstallmentItem[];
  payments: FeePaymentItem[];
  adjustments: FeeAdjustmentItem[];
}

export interface ConfigureFeePayload {
  student_id: string;
  plan_type: string;
  total_fee_amount: number;
  start_date?: string;
  currency?: string;
  number_of_installments?: number;
  custom_installments?: Array<{ label?: string; due_date: string; amount: number }>;
  notes?: string;
}

export interface CollectFeePaymentPayload {
  amount: number;
  payment_date?: string;
  payment_method: string;
  reference_number?: string;
  target_installment_id?: string;
  notes?: string;
  send_receipt_email?: boolean;
}

export interface CourseFeeConfigurationData {
  is_configured: boolean;
  configuration_id?: string;
  course_id: string;
  plan_type?: string;
  total_fee?: number;
  currency?: string;
  number_of_installments?: number;
  start_date?: string;
  custom_installments?: Array<{ label?: string; due_date: string; amount: number }>;
  notes?: string;
}

export const courseFeesCollectionService = {
  async getSummary(courseUuid: string): Promise<CourseFeeSummary> {
    const res = await apiClient.get(`/api/v1/payments/courses/${courseUuid}/fee-summary/`);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data) as CourseFeeSummary;
  },

  async getCourseFeeConfiguration(courseUuid: string): Promise<CourseFeeConfigurationData> {
    const res = await apiClient.get(`/api/v1/payments/courses/${courseUuid}/fee-configuration/`);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data) as CourseFeeConfigurationData;
  },

  async saveCourseFeeConfiguration(courseUuid: string, payload: ConfigureFeePayload): Promise<CourseFeeConfigurationData> {
    const res = await apiClient.post(`/api/v1/payments/courses/${courseUuid}/fee-configuration/`, payload);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data);
  },

  async getStudentAccounts(courseUuid: string, params?: { search?: string; status?: string }): Promise<StudentFeeRecordItem[]> {
    const cleanParams: Record<string, string> = {};
    if (params?.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    if (params?.status && params.status !== 'all') {
      cleanParams.status = params.status;
    }
    const res = await apiClient.get(`/api/v1/payments/courses/${courseUuid}/fee-accounts/`, { params: cleanParams });
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data) as StudentFeeRecordItem[];
  },

  async configureAccount(courseUuid: string, payload: ConfigureFeePayload): Promise<{ fee_account_id: string; status: string }> {
    const res = await apiClient.post(`/api/v1/payments/courses/${courseUuid}/fee-accounts/`, payload);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data);
  },

  async getAccountDetail(courseUuid: string, accountId: string): Promise<StudentFeeAccountDetail> {
    const res = await apiClient.get(`/api/v1/payments/courses/${courseUuid}/fee-accounts/${accountId}/`);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data) as StudentFeeAccountDetail;
  },

  async collectPayment(courseUuid: string, accountId: string, payload: CollectFeePaymentPayload): Promise<{ payment_id: string; receipt_number: string; amount: number; status: string }> {
    const res = await apiClient.post(`/api/v1/payments/courses/${courseUuid}/fee-accounts/${accountId}/payments/`, payload);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data);
  },

  async waiveFee(courseUuid: string, accountId: string, payload: { amount: number; reason?: string }): Promise<{ adjustment_id: string; new_effective_fee: number }> {
    const res = await apiClient.post(`/api/v1/payments/courses/${courseUuid}/fee-accounts/${accountId}/waive/`, payload);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data);
  },

  async sendReminder(courseUuid: string, accountId: string, payload: { send_email?: boolean; reminder_type?: string }): Promise<void> {
    await apiClient.post(`/api/v1/payments/courses/${courseUuid}/fee-accounts/${accountId}/reminder/`, payload);
  },

  async getPaymentsLedger(courseUuid: string): Promise<Array<FeePaymentItem & { student_id: string; student_name: string; student_email: string; student_code: string }>> {
    const res = await apiClient.get(`/api/v1/payments/courses/${courseUuid}/fee-payments/`);
    const data = res.data;
    return (data && typeof data === 'object' && 'data' in data ? data.data : data);
  },
};

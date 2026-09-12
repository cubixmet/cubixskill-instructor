import { apiClient } from "../api/client";
import type { BackendApiResponse, PaginatedResponse } from "../api/types";

export interface CertificateData {
  id: string;
  certificate_number: string;
  verification_code: string;
  student: string; // user_id
  student_name_snapshot: string;
  student_email?: string;
  course: string; // course_id
  course_name_snapshot: string;
  academy_name_snapshot: string;
  issued_at: string;
  completed_at?: string;
  status: 'ISSUED' | 'REVOKED' | 'DRAFT';
  revoked_at?: string;
  revocation_reason?: string;
  pdf_media?: any;
  created_at: string;
}

export interface CertificateSummaryData {
  total_certificates: number;
  issued_this_month: number;
  active_certificates: number;
  revoked_certificates: number;
}

export interface CertificateTemplateData {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  template_data: any;
  orientation?: 'LANDSCAPE' | 'PORTRAIT';
  page_size?: 'A4' | 'LETTER' | 'CUSTOM';
  custom_width?: number;
  custom_height?: number;
  custom_unit?: 'MM' | 'CM' | 'INCH';
  background_media?: any;
  background_media_url?: string;
  show_student_photo?: boolean;
  student_photo_shape?: string;
  is_default?: boolean;
  is_active?: boolean;
  course_id?: string;
  course_name?: string;
  created_at?: string;
}

export interface CertificateBinding {
  key: string;
  label: string;
  group: string;
  type: 'text' | 'image' | 'qr';
}

export interface StudentCustomField {
  id: string;
  key: string;
  label: string;
  field_type: string;
  available_for_certificate: boolean;
  required: boolean;
  sort_order: number;
  is_active?: boolean;
}

export interface ManualIssuePayload {
  student_id: string;
  course_id: string;
  template_id?: string;
  certificate_photo_id?: string;
}

export const certificatesService = {
  // --- ISSUED CERTIFICATES ---
  async listCertificates(params?: Record<string, any>): Promise<PaginatedResponse<CertificateData> | CertificateData[]> {
    const response = await apiClient.get<BackendApiResponse<PaginatedResponse<CertificateData>> | PaginatedResponse<CertificateData> | CertificateData[]>(
      '/api/v1/certificates/certificates/',
      { params }
    );
    const data = (response.data as any)?.data || response.data;
    return data;
  },

  async getSummary(): Promise<CertificateSummaryData> {
    const response = await apiClient.get<BackendApiResponse<CertificateSummaryData>>(
      '/api/v1/certificates/certificates/summary/'
    );
    return response.data?.data || (response.data as unknown as CertificateSummaryData);
  },

  async getCertificate(id: string): Promise<CertificateData> {
    const response = await apiClient.get<BackendApiResponse<CertificateData>>(
      `/api/v1/certificates/certificates/${id}/`
    );
    return response.data?.data || (response.data as unknown as CertificateData);
  },

  async issueCertificate(payload: ManualIssuePayload): Promise<CertificateData> {
    const response = await apiClient.post<BackendApiResponse<CertificateData>>(
      '/api/v1/certificates/certificates/issue/',
      payload
    );
    return response.data?.data || (response.data as unknown as CertificateData);
  },

  async revokeCertificate(id: string, reason: string): Promise<CertificateData> {
    const response = await apiClient.post<BackendApiResponse<CertificateData>>(
      `/api/v1/certificates/certificates/${id}/revoke/`,
      { reason }
    );
    return response.data?.data || (response.data as unknown as CertificateData);
  },

  async downloadCertificate(id: string): Promise<Blob> {
    const response = await apiClient.get(`/api/v1/certificates/certificates/${id}/download/`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  // --- TEMPLATES ---
  async listTemplates(): Promise<CertificateTemplateData[]> {
    const response = await apiClient.get<BackendApiResponse<CertificateTemplateData[]> | CertificateTemplateData[]>(
      '/api/v1/certificates/certificate-templates/'
    );
    const data = (response.data as any)?.data || response.data;
    return Array.isArray(data) ? data : (data as any)?.results || [];
  },

  async getTemplate(id: string): Promise<CertificateTemplateData> {
    const response = await apiClient.get<BackendApiResponse<CertificateTemplateData>>(
      `/api/v1/certificates/certificate-templates/${id}/`
    );
    return response.data?.data || (response.data as unknown as CertificateTemplateData);
  },

  async getTemplateBySlug(slug: string): Promise<CertificateTemplateData> {
    const response = await apiClient.get<BackendApiResponse<CertificateTemplateData> | CertificateTemplateData>(
      `/api/v1/certificates/certificate-templates/by-slug/${encodeURIComponent(slug)}/`
    );
    return (response.data as any)?.data || (response.data as CertificateTemplateData);
  },

  async createTemplate(payload: Partial<CertificateTemplateData>): Promise<CertificateTemplateData> {
    const response = await apiClient.post<BackendApiResponse<CertificateTemplateData>>(
      '/api/v1/certificates/certificate-templates/',
      payload
    );
    return response.data?.data || (response.data as unknown as CertificateTemplateData);
  },

  async updateTemplate(id: string, payload: Partial<CertificateTemplateData>): Promise<CertificateTemplateData> {
    const response = await apiClient.patch<BackendApiResponse<CertificateTemplateData>>(
      `/api/v1/certificates/certificate-templates/${id}/`,
      payload
    );
    return response.data?.data || (response.data as unknown as CertificateTemplateData);
  },

  async deleteTemplate(id: string): Promise<any> {
    const response = await apiClient.delete(`/api/v1/certificates/certificate-templates/${id}/`);
    return response.data;
  },

  async publishTemplate(id: string): Promise<{ message: string; version_number: number }> {
    const response = await apiClient.post<{ message: string; version_number: number }>(
      `/api/v1/certificates/certificate-templates/${id}/publish/`
    );
    return response.data;
  },

  async duplicateTemplate(id: string): Promise<CertificateTemplateData> {
    const response = await apiClient.post<CertificateTemplateData>(
      `/api/v1/certificates/certificate-templates/${id}/duplicate/`
    );
    return response.data;
  },

  async assignCourseToTemplate(templateId: string, courseId: string, autoIssue = true): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/api/v1/certificates/certificate-templates/${templateId}/assign-course/`,
      { course_id: courseId, auto_issue: autoIssue }
    );
    return response.data;
  },

  // --- DYNAMIC BINDINGS ---
  async getTemplateBindings(courseId?: string): Promise<CertificateBinding[]> {
    const response = await apiClient.get<CertificateBinding[]>(
      '/api/v1/certificates/template-bindings/',
      { params: courseId ? { course_id: courseId } : {} }
    );
    return response.data || [];
  },

  // --- CUSTOM STUDENT FIELDS ---
  async listCustomFields(): Promise<StudentCustomField[]> {
    const response = await apiClient.get<StudentCustomField[] | PaginatedResponse<StudentCustomField>>(
      '/api/v1/students/custom-fields/'
    );
    const data = (response.data as any)?.results || response.data;
    return Array.isArray(data) ? data : [];
  },

  async createCustomField(payload: Partial<StudentCustomField>): Promise<StudentCustomField> {
    const response = await apiClient.post<StudentCustomField>(
      '/api/v1/students/custom-fields/',
      payload
    );
    return response.data;
  },

  async updateCustomField(id: string, payload: Partial<StudentCustomField>): Promise<StudentCustomField> {
    const response = await apiClient.patch<StudentCustomField>(
      `/api/v1/students/custom-fields/${id}/`,
      payload
    );
    return response.data;
  },

  async deleteCustomField(id: string): Promise<any> {
    const response = await apiClient.delete(
      `/api/v1/students/custom-fields/${id}/`
    );
    return response.data;
  },

  // --- CERTIFICATE FONTS ---
  async listFonts(): Promise<any[]> {
    const response = await apiClient.get<any>('/api/v1/certificates/fonts/');
    const data = (response.data as any)?.data || response.data;
    return Array.isArray(data) ? data : (data as any)?.results || [];
  },

  async uploadFont(formData: FormData): Promise<any> {
    const response = await apiClient.postForm<any>('/api/v1/certificates/fonts/upload/', formData);
    return response.data?.data || response.data;
  },
};

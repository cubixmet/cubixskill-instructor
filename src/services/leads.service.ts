import { apiClient } from "../api/client";
import type { BackendApiResponse, PaginatedResponse } from "../api/types";

export interface LeadData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'QUALIFIED' | 'FOLLOW_UP' | 'CONVERTED' | 'LOST' | 'DISQUALIFIED';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  source?: string;
  source_detail?: string;
  preferred_contact_method?: string;
  assigned_to_id?: string;
  assigned_to_name?: string;
  assigned_to_email?: string;
  converted_student_id?: string;
  next_follow_up_at?: string;
  last_contacted_at?: string;
  converted_at?: string;
  lost_reason?: string;
  notes_summary?: string;
  course_interests?: Array<{
    id: string;
    course_id: string;
    course_title: string;
    interest_level: string;
  }>;
  notes?: Array<{
    id: string;
    author_name?: string;
    content: string;
    created_at: string;
  }>;
  follow_ups?: Array<{
    id: string;
    follow_up_type: string;
    scheduled_at: string;
    completed_at?: string;
    status: string;
    notes?: string;
  }>;
  created_at: string;
  updated_at?: string;
}

export interface LeadSummaryData {
  total_leads: number;
  new_leads: number;
  interested: number;
  qualified: number;
  converted: number;
  lost: number;
  follow_ups_today: number;
  overdue_follow_ups: number;
}

export interface LeadTimelineEvent {
  type: string;
  event: string;
  timestamp: string;
  performed_by?: string;
  details?: any;
}

export const leadsService = {
  async listLeads(params?: Record<string, any>): Promise<PaginatedResponse<LeadData> | LeadData[]> {
    const response = await apiClient.get<BackendApiResponse<PaginatedResponse<LeadData>> | PaginatedResponse<LeadData> | LeadData[]>(
      '/api/v1/leads/leads/',
      { params }
    );
    const data = (response.data as any)?.data || response.data;
    return data;
  },

  async getSummary(): Promise<LeadSummaryData> {
    const response = await apiClient.get<BackendApiResponse<LeadSummaryData>>(
      '/api/v1/leads/leads/summary/'
    );
    return response.data?.data || (response.data as unknown as LeadSummaryData);
  },

  async getLead(id: string): Promise<LeadData> {
    const response = await apiClient.get<BackendApiResponse<LeadData>>(
      `/api/v1/leads/leads/${id}/`
    );
    return response.data?.data || (response.data as unknown as LeadData);
  },

  async createLead(payload: {
    full_name: string;
    email?: string;
    phone?: string;
    source?: string;
    priority?: string;
    course_id?: string;
  }): Promise<LeadData> {
    const response = await apiClient.post<BackendApiResponse<LeadData>>(
      '/api/v1/leads/leads/',
      payload
    );
    return response.data?.data || (response.data as unknown as LeadData);
  },

  async updateStatus(id: string, newStatus: string, lostReason?: string): Promise<LeadData> {
    const response = await apiClient.post<BackendApiResponse<LeadData>>(
      `/api/v1/leads/leads/${id}/status/`,
      { status: newStatus, lost_reason: lostReason || '' }
    );
    return response.data?.data || (response.data as unknown as LeadData);
  },

  async assignLead(id: string, assignedToId: string, reason?: string): Promise<LeadData> {
    const response = await apiClient.post<BackendApiResponse<LeadData>>(
      `/api/v1/leads/leads/${id}/assign/`,
      { assigned_to_id: assignedToId, reason: reason || '' }
    );
    return response.data?.data || (response.data as unknown as LeadData);
  },

  async convertLead(id: string, payload?: { course_id?: string; create_enrollment?: boolean }): Promise<any> {
    const response = await apiClient.post<BackendApiResponse<any>>(
      `/api/v1/leads/leads/${id}/convert/`,
      payload || {}
    );
    return response.data?.data || response.data;
  },

  async getTimeline(id: string): Promise<LeadTimelineEvent[]> {
    const response = await apiClient.get<BackendApiResponse<LeadTimelineEvent[]>>(
      `/api/v1/leads/leads/${id}/timeline/`
    );
    return (response.data as any)?.data || response.data || [];
  },

  async addNote(id: string, content: string): Promise<any> {
    const response = await apiClient.post<BackendApiResponse<any>>(
      `/api/v1/leads/leads/${id}/notes/`,
      { content }
    );
    return response.data?.data || response.data;
  },

  async scheduleFollowUp(id: string, payload: { scheduled_at: string; follow_up_type?: string; notes?: string }): Promise<any> {
    const response = await apiClient.post<BackendApiResponse<any>>(
      `/api/v1/leads/leads/${id}/follow-ups/`,
      payload
    );
    return response.data?.data || response.data;
  },
};

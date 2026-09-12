import apiClient from '../api/client';

export interface SupportTicketAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  created_at: string;
}

export interface TicketReplyMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_email: string;
  role: 'customer' | 'support';
  is_internal_note: boolean;
  message: string;
  attachments: SupportTicketAttachment[];
  created_at: string;
}

export interface BackendSupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  user_id: string;
  user_name: string;
  user_email: string;
  academy_id: string;
  academy_name: string;
  created_at: string;
  updated_at: string;
  last_updated_human: string;
  description?: string;
  replies?: TicketReplyMessage[];
  attachments?: SupportTicketAttachment[];
  assigned_to_id?: string;
  assigned_to_name?: string;
}

export interface CreateTicketPayload {
  subject: string;
  category: string;
  priority: string;
  description: string;
  attachment_ids?: string[];
}

export interface CreateReplyPayload {
  message: string;
  is_internal_note?: boolean;
  attachment_ids?: string[];
}

export interface PaginatedTicketsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BackendSupportTicket[];
}

export const supportService = {
  getTickets: async (params?: {
    search?: string;
    status?: string;
    category?: string;
    priority?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedTicketsResponse> => {
    const response = await apiClient.get('/api/v1/support/tickets/', { params });
    const data = response.data;
    if (Array.isArray(data)) {
      return {
        count: data.length,
        next: null,
        previous: null,
        results: data,
      };
    }
    return {
      count: data.count || 0,
      next: data.next || null,
      previous: data.previous || null,
      results: Array.isArray(data.results) ? data.results : [],
    };
  },

  getTicket: async (idOrNumber: string): Promise<BackendSupportTicket> => {
    const response = await apiClient.get(`/api/v1/support/tickets/${idOrNumber}/`);
    return response.data;
  },

  createTicket: async (payload: CreateTicketPayload): Promise<BackendSupportTicket> => {
    const response = await apiClient.post('/api/v1/support/tickets/', payload);
    return response.data;
  },

  addReply: async (ticketId: string, payload: CreateReplyPayload): Promise<TicketReplyMessage> => {
    const response = await apiClient.post(`/api/v1/support/tickets/${ticketId}/reply/`, payload);
    return response.data;
  },

  updateTicketStatus: async (
    ticketId: string,
    status?: string,
    priority?: string
  ): Promise<BackendSupportTicket> => {
    const response = await apiClient.patch(`/api/v1/support/tickets/${ticketId}/status/`, {
      status,
      priority,
    });
    return response.data;
  },
};

export default supportService;

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { BackendApiResponse, PaginatedResponse } from "../api/types";

export interface BackendLiveSession {
  id: string;
  course?: string | { id: string; title: string };
  course_title?: string;
  title: string;
  description: string;
  session_mode: 'EXTERNAL' | 'NATIVE';
  provider: 'GOOGLE_MEET' | 'ZOOM' | 'MICROSOFT_TEAMS' | 'CUSTOM' | 'NATIVE_SFU';
  scheduled_start: string;
  scheduled_end: string;
  actual_started_at?: string | null;
  actual_ended_at?: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  effective_status?: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  is_joinable?: boolean;
  meeting_url: string;
  native_room_id?: string;
  host?: string | { id: string; full_name?: string; email: string };
  host_name?: string | null;
  max_participants: number;
  allow_chat?: boolean;
  allow_raise_hand?: boolean;
  allow_screen_share?: boolean;
  recording_enabled: boolean;
  is_recording_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLiveSessionPayload {
  course_id: string;
  title: string;
  description?: string;
  scheduled_start: string;
  scheduled_end: string;
  session_mode?: 'EXTERNAL' | 'NATIVE';
  provider?: 'GOOGLE_MEET' | 'ZOOM' | 'MICROSOFT_TEAMS' | 'CUSTOM' | 'NATIVE_SFU';
  meeting_url?: string;
  max_participants?: number;
  recording_enabled?: boolean;
  send_email?: boolean;
  announce_on_create?: boolean;
  status?: string;
}

export interface UpdateLiveSessionPayload {
  title?: string;
  description?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  session_mode?: 'EXTERNAL' | 'NATIVE';
  provider?: 'GOOGLE_MEET' | 'ZOOM' | 'MICROSOFT_TEAMS' | 'CUSTOM' | 'NATIVE_SFU';
  meeting_url?: string;
  max_participants?: number;
  recording_enabled?: boolean;
  send_email?: boolean;
}

export const liveSessionsService = {
  async list(courseId?: string): Promise<BackendLiveSession[]> {
    const params = courseId ? { course: courseId } : {};
    const response = await apiClient.get<BackendApiResponse<PaginatedResponse<BackendLiveSession>> | BackendLiveSession[] | PaginatedResponse<BackendLiveSession>>(
      API_ENDPOINTS.LIVE_SESSIONS.LIST,
      { params }
    );

    const rawData = response.data;
    if (Array.isArray(rawData)) return rawData;
    if ('data' in rawData && rawData.data) {
      if (Array.isArray(rawData.data)) return rawData.data;
      if ('results' in rawData.data && Array.isArray((rawData.data as any).results)) {
        return (rawData.data as any).results;
      }
    }
    if ('results' in rawData && Array.isArray((rawData as any).results)) {
      return (rawData as any).results;
    }
    return [];
  },

  async get(id: string): Promise<BackendLiveSession> {
    const response = await apiClient.get<BackendApiResponse<BackendLiveSession> | BackendLiveSession>(
      API_ENDPOINTS.LIVE_SESSIONS.DETAIL(id)
    );
    return (response.data as any)?.data || response.data;
  },

  async create(payload: CreateLiveSessionPayload): Promise<BackendLiveSession> {
    const response = await apiClient.post<BackendApiResponse<BackendLiveSession> | BackendLiveSession>(
      API_ENDPOINTS.LIVE_SESSIONS.LIST,
      payload
    );
    return (response.data as any)?.data || response.data;
  },

  async update(id: string, payload: UpdateLiveSessionPayload): Promise<BackendLiveSession> {
    const response = await apiClient.patch<BackendApiResponse<BackendLiveSession> | BackendLiveSession>(
      API_ENDPOINTS.LIVE_SESSIONS.DETAIL(id),
      payload
    );
    return (response.data as any)?.data || response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.LIVE_SESSIONS.DETAIL(id));
  },

  async start(id: string): Promise<BackendLiveSession> {
    const response = await apiClient.post<BackendApiResponse<BackendLiveSession> | BackendLiveSession>(
      API_ENDPOINTS.LIVE_SESSIONS.START(id)
    );
    return (response.data as any)?.data || response.data;
  },

  async end(id: string, reason = ''): Promise<BackendLiveSession> {
    const response = await apiClient.post<BackendApiResponse<BackendLiveSession> | BackendLiveSession>(
      API_ENDPOINTS.LIVE_SESSIONS.END(id),
      { reason }
    );
    return (response.data as any)?.data || response.data;
  },

  async cancel(id: string, reason = ''): Promise<BackendLiveSession> {
    const response = await apiClient.post<BackendApiResponse<BackendLiveSession> | BackendLiveSession>(
      API_ENDPOINTS.LIVE_SESSIONS.CANCEL(id),
      { reason }
    );
    return (response.data as any)?.data || response.data;
  },

  async join(id: string): Promise<{ session_id: string; meeting_url: string; provider: string }> {
    const response = await apiClient.post<BackendApiResponse<any> | any>(
      API_ENDPOINTS.LIVE_SESSIONS.JOIN(id)
    );
    return (response.data as any)?.data || response.data;
  },

  async leave(id: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.LIVE_SESSIONS.LEAVE(id));
  },
};

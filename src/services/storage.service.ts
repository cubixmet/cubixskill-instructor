import { apiClient } from '../api/client';

export interface StorageEstimateRequest {
  filename: string;
  file_size_bytes: number;
  mime_type?: string;
  duration_seconds?: number;
  width?: number;
  height?: number;
  adaptive_streaming_enabled?: boolean;
}

export interface EstimatedRendition {
  quality_label: string;
  width: number;
  height: number;
  video_bitrate_kbps: number;
  audio_bitrate_kbps: number;
  estimated_bytes: number;
  estimated_display: string;
}

export interface PreUploadEstimateResponse {
  filename: string;
  file_size_bytes: number;
  file_size_display: string;
  is_video: boolean;
  duration_seconds: number;
  width: number;
  height: number;
  resolution_display: string;
  estimated_source_bytes: number;
  estimated_source_display: string;
  estimated_streaming_bytes: number;
  estimated_streaming_display: string;
  estimated_total_bytes: number;
  estimated_total_display: string;
  current_storage_bytes: number;
  current_storage_display: string;
  projected_storage_bytes: number;
  projected_storage_display: string;
  rate_cost: string;
  rate_display: string;
  estimated_monthly_credits: string;
  adaptive_streaming_enabled: boolean;
  planned_qualities: string[];
  renditions: EstimatedRendition[];
}

export interface VideoRenditionItem {
  quality_label: string;
  width: number;
  height: number;
  video_bitrate_kbps: number;
  audio_bitrate_kbps: number;
  playlist_key: string;
  size_bytes: number;
  status: string;
}

export interface MediaFileApiItem {
  id: string;
  original_filename: string;
  display_name: string;
  stored_filename: string;
  storage_key: string;
  relative_path: string;
  mime_type: string;
  file_type: string;
  file_extension: string;
  size_bytes: number;
  source_size_bytes?: number;
  streaming_size_bytes?: number;
  total_storage_bytes?: number;
  media_type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'OTHER';
  status: string;
  adaptive_streaming_enabled?: boolean;
  processing_mode?: 'hls' | 'direct';
  processing_status?: 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED';
  processing_progress?: number;
  processing_error?: string;
  processed_at?: string;
  duration_seconds?: number;
  width?: number;
  height?: number;
  stream_manifest_key?: string;
  url: string;
  stream_url?: string;
  renditions?: VideoRenditionItem[];
  created_at: string;
  updated_at?: string;
  uploaded_at?: string;
  uploaded_by_uuid?: string;
  usage_count: number;
}

export interface StorageUsageSummary {
  used_bytes: number;
  used_display: string;
  total_files_count: number;
}

export interface StorageCurrentPeriodUsage {
  used_bytes: number;
  used_display: string;
  billing_period: string;
  billing_period_start: string;
  billing_period_end: string;
  byte_seconds: number;
  gb_hours: string;
  gb_days: string;
  gb_month: string;
  estimated_credits: string;
}

export interface StorageDailyRollup {
  id: string;
  interval_type: string;
  period_start: string;
  period_end: string;
  opening_bytes: number;
  closing_bytes: number;
  peak_bytes: number;
  uploaded_bytes: number;
  deleted_bytes: number;
  byte_seconds: number;
  upload_count: number;
  delete_count: number;
}

export interface StorageMonthlyBillingStatement {
  id: string;
  billing_period: string;
  billing_period_start: string;
  billing_period_end: string;
  total_byte_seconds: number;
  billable_units_gb_month: string;
  credits_calculated: string;
  credits_charged: string;
  status: string;
  calculated_at: string;
  charged_at?: string;
}

export interface MediaUsageReference {
  id: string;
  type: string;
  title: string;
  context: string;
  course_id?: string | null;
  lesson_id?: string | null;
}

export interface MediaUsageResponse {
  file_id: string;
  is_used: boolean;
  usage_count: number;
  references: MediaUsageReference[];
}

export interface GetMediaParams {
  search?: string;
  media_type?: string;
  ordering?: string;
  unused_only?: boolean;
  page?: number;
  page_size?: number;
}

export interface MediaListResponse {
  count: number;
  results: MediaFileApiItem[];
  next?: string | null;
  previous?: string | null;
}

export const storageService = {
  async estimateUpload(payload: StorageEstimateRequest): Promise<PreUploadEstimateResponse> {
    const response = await apiClient.post<{ data: PreUploadEstimateResponse } | PreUploadEstimateResponse>(
      '/api/v1/storage/estimate-upload/',
      payload
    );
    return (response.data as { data?: PreUploadEstimateResponse })?.data || (response.data as PreUploadEstimateResponse);
  },

  async getStorageUsage(): Promise<StorageUsageSummary> {
    const response = await apiClient.get('/api/v1/storage/usage/');
    const raw = response.data?.data || response.data;
    return {
      used_bytes: raw?.used_bytes || 0,
      used_display: raw?.used_display || '0 B',
      total_files_count: raw?.total_files_count || 0,
    };
  },

  async getCurrentPeriodUsage(): Promise<StorageCurrentPeriodUsage> {
    const response = await apiClient.get('/api/v1/storage/usage/current-period/');
    return response.data?.data || response.data;
  },

  async getDailyRollups(): Promise<StorageDailyRollup[]> {
    const response = await apiClient.get('/api/v1/storage/usage/daily/');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  async getMonthlyBillings(): Promise<StorageMonthlyBillingStatement[]> {
    const response = await apiClient.get('/api/v1/storage/billing/');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  async getMediaFiles(params?: GetMediaParams): Promise<MediaListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.media_type && params.media_type.toUpperCase() !== 'ALL') {
      query.append('media_type', params.media_type);
    }
    if (params?.ordering) query.append('ordering', params.ordering);
    if (params?.unused_only) query.append('unused_only', 'true');
    if (params?.page) query.append('page', String(params.page));
    if (params?.page_size) query.append('page_size', String(params.page_size));

    const url = `/api/v1/storage/files/${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await apiClient.get(url);
    const data = response.data;

    if (Array.isArray(data)) {
      return { count: data.length, results: data };
    }
    if (data && Array.isArray(data.data)) {
      return { count: data.data.length, results: data.data };
    }
    if (data && Array.isArray(data.results)) {
      return { count: data.count || data.results.length, results: data.results, next: data.next, previous: data.previous };
    }

    return { count: 0, results: [] };
  },

  async uploadFile(
    file: File,
    options?: { course_uuid?: string; lesson_uuid?: string; adaptive_streaming_enabled?: boolean; hls_enabled?: boolean; onProgress?: (pct: number) => void }
  ): Promise<MediaFileApiItem> {
    const formData = new FormData();
    formData.append('file', file);

    if (options?.course_uuid) {
      formData.append('course_uuid', options.course_uuid);
    }
    if (options?.lesson_uuid) {
      formData.append('lesson_uuid', options.lesson_uuid);
    }
    if (options?.adaptive_streaming_enabled !== undefined) {
      formData.append('adaptive_streaming_enabled', String(options.adaptive_streaming_enabled));
    }
    if (options?.hls_enabled !== undefined) {
      formData.append('hls_enabled', options.hls_enabled ? 'true' : 'false');
    }

    const response = await apiClient.post('/api/v1/storage/upload/', formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && options?.onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(percent);
        }
      },
    });

    return response.data?.data || response.data;
  },

  async updateMediaFile(id: string, payload: { display_name?: string; original_filename?: string }): Promise<MediaFileApiItem> {
    const response = await apiClient.patch(`/api/v1/storage/files/${id}/`, payload);
    return response.data?.data || response.data;
  },

  async getMediaUsage(id: string): Promise<MediaUsageResponse> {
    const response = await apiClient.get(`/api/v1/storage/files/${id}/usage/`);
    return response.data?.data || response.data;
  },

  async retryProcessing(id: string): Promise<MediaFileApiItem> {
    const response = await apiClient.post(`/api/v1/storage/files/${id}/retry-processing/`);
    return response.data?.data || response.data;
  },

  async convertHls(id: string): Promise<MediaFileApiItem> {
    const response = await apiClient.post(`/api/v1/storage/files/${id}/convert-hls/`);
    return response.data?.data || response.data;
  },

  async deleteMediaFile(id: string, force: boolean = false): Promise<void> {
    const query = force ? '?force=true' : '';
    await apiClient.delete(`/api/v1/storage/files/${id}/${query}`);
  },
};

export const mediaService = storageService;

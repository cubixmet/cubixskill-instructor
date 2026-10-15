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
  estimated_daily_credits?: string;
  daily_cost_display?: string;
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
  file_url?: string;
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

export interface StorageSummaryDashboard {
  billing_enabled: boolean;
  billing_interval?: string;
  billing_interval_label?: string;
  metering_interval?: string;
  metering_interval_label?: string;
  current_storage_bytes: number;
  current_storage_gb: string;
  file_count?: number;
  credit_rate_per_gb: string;
  current_cycle_accumulated_credits?: string;
  current_cycle_meter_count?: number;
  outstanding_storage_credits?: string;
  has_outstanding_storage_balance?: boolean;
  last_settlement_status?: string | null;
  last_metered_at?: string | null;
  next_meter_at?: string | null;
  previous_settlement_at?: string | null;
  next_settlement_at?: string | null;
  next_credit_debit_at?: string | null;
  last_successful_debit_at?: string | null;
  estimated_next_charge?: string;
  last_billed_at?: string | null;
  last_debited_at?: string | null;
  next_billing_at?: string | null;
}

export interface StorageMeterLogItem {
  id: string;
  metered_at: string;
  used_bytes: number;
  used_gb: string;
  credit_rate_per_gb: string;
  calculated_credits: string;
  metering_interval: string;
  metering_interval_label: string;
  created_at: string;
}

export interface StorageMeterLogsResponse {
  count: number;
  total_pages: number;
  page: number;
  page_size: number;
  results: StorageMeterLogItem[];
}

export interface StorageSettlementItem {
  id: string;
  cycle_start_at: string;
  cycle_end_at: string | null;
  status: string;
  settlement_status?: string;
  accumulated_credits: string;
  original_amount?: string;
  paid_amount?: string;
  outstanding_amount?: string;
  storage_billed?: string;
  credits_paid?: string;
  outstanding?: string;
  credits_debited: string;
  meter_record_count: number;
  debited_at: string | null;
  settled_at?: string | null;
  created_at: string;
}

export interface StorageSettlementsResponse {
  period_label: string;
  total_settlements: number;
  credits_debited: string;
  storage_billed?: string;
  credits_paid?: string;
  outstanding?: string;
  count: number;
  total_pages: number;
  page: number;
  page_size: number;
  results: StorageSettlementItem[];
}

export interface ControlPanelStorageSettings {
  id?: string;
  storage_billing_enabled: boolean;
  billing_enabled?: boolean;
  storage_billing_interval: '10_SECONDS' | '6_HOURS' | '12_HOURS' | '18_HOURS' | '1_DAY';
  storage_credit_rate_per_gb: string;
  billing_interval_label?: string;
}

export interface StorageSnapshotItem {
  id: string;
  captured_at: string;
  used_bytes: number;
  used_gb: string;
  file_count: number;
  source: string;
}

export interface StorageUsageChargeItem {
  id: string;
  billing_started_at?: string;
  billing_ended_at?: string;
  interval?: string;
  billing_interval?: string;
  interval_label?: string;
  billing_interval_label?: string;
  used_bytes?: number;
  used_gb?: string;
  storage_gb?: string;
  rate_per_gb?: string;
  credit_rate_per_gb?: string;
  charged_credits?: string;
  credits_debited?: string;
  status: 'SUCCESS' | 'FAILED' | string;
  debited_at?: string | null;
  created_at?: string;
}

export type StorageBillingPeriodItem = StorageUsageChargeItem;

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

  async getSummaryDashboard(): Promise<StorageSummaryDashboard> {
    const response = await apiClient.get('/api/v1/storage/summary/');
    return response.data?.data || response.data;
  },

  async getMeterLogs(params?: { page?: number; page_size?: number; month?: number; year?: number }): Promise<StorageMeterLogsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.page_size) query.append('page_size', String(params.page_size));
    if (params?.month) query.append('month', String(params.month));
    if (params?.year) query.append('year', String(params.year));

    const url = `/api/v1/storage/meter-logs/${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await apiClient.get(url);
    const raw = response.data?.data || response.data;
    return {
      count: raw?.count || 0,
      total_pages: raw?.total_pages || 1,
      page: raw?.page || 1,
      page_size: raw?.page_size || 25,
      results: Array.isArray(raw?.results) ? raw.results : []
    };
  },

  async getSettlements(params?: { page?: number; page_size?: number; month?: number; year?: number }): Promise<StorageSettlementsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.page_size) query.append('page_size', String(params.page_size));
    if (params?.month) query.append('month', String(params.month));
    if (params?.year) query.append('year', String(params.year));

    const url = `/api/v1/storage/settlements/${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await apiClient.get(url);
    const raw = response.data?.data || response.data;
    return {
      period_label: raw?.period_label || '',
      total_settlements: raw?.total_settlements || 0,
      credits_debited: raw?.credits_debited || '0.0000',
      count: raw?.count || 0,
      total_pages: raw?.total_pages || 1,
      page: raw?.page || 1,
      page_size: raw?.page_size || 25,
      results: Array.isArray(raw?.results) ? raw.results : []
    };
  },

  async getSnapshots(): Promise<StorageSnapshotItem[]> {
    const response = await apiClient.get('/api/v1/storage/snapshots/');
    return response.data?.data || response.data || [];
  },

  async getBillingPeriods(): Promise<StorageUsageChargeItem[]> {
    const response = await apiClient.get('/api/v1/storage/billing-periods/');
    return response.data?.data || response.data || [];
  },

  async getChargesHistory(): Promise<StorageUsageChargeItem[]> {
    const response = await apiClient.get('/api/v1/storage/billing/');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  async getControlPanelSettings(): Promise<ControlPanelStorageSettings> {
    const response = await apiClient.get('/api/v1/storage/control-panel/settings/');
    return response.data?.data || response.data;
  },

  async updateControlPanelSettings(payload: Partial<ControlPanelStorageSettings>): Promise<ControlPanelStorageSettings> {
    const response = await apiClient.post('/api/v1/storage/control-panel/settings/', payload);
    return response.data?.data || response.data;
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
    if (!file || file.size === 0) {
      throw new Error('FILE_EMPTY: Selected file is empty (0 bytes). Please choose a valid file.');
    }

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

    const raw = response.data?.data || response.data;
    if (!raw || !raw.id) {
      throw new Error('UPLOAD_FAILED: Backend storage upload succeeded but returned no MediaFile ID.');
    }

    return {
      id: String(raw.id),
      original_filename: raw.original_filename || raw.filename || file.name,
      display_name: raw.display_name || raw.original_filename || file.name,
      stored_filename: raw.stored_filename || '',
      storage_key: raw.storage_key || '',
      relative_path: raw.relative_path || '',
      mime_type: raw.mime_type || file.type,
      file_type: raw.file_type || '',
      file_extension: raw.file_extension || '',
      size_bytes: raw.size_bytes || file.size,
      media_type: raw.media_type || (file.type.startsWith('image/') ? 'IMAGE' : file.type.startsWith('video/') ? 'VIDEO' : file.type.startsWith('audio/') ? 'AUDIO' : 'DOCUMENT'),
      status: raw.status || 'READY',
      url: raw.url || raw.media_url || (typeof raw.file === 'string' ? raw.file : ''),
      created_at: raw.created_at || new Date().toISOString(),
      usage_count: raw.usage_count || 0,
      ...raw,
    };
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

  async bulkDeleteMediaFiles(fileIds: string[]): Promise<{
    deleted_ids: string[];
    deleted_count: number;
    blocked_items: Array<{
      id: string;
      filename: string;
      reason: string;
      references: any[];
    }>;
    blocked_count: number;
    failed_count: number;
    total_requested: number;
  }> {
    const response = await apiClient.post('/api/v1/storage/files/bulk-delete/', { file_ids: fileIds });
    return response.data?.data || response.data;
  },

  async getMeterRecordFiles(meterId: string): Promise<{
    has_file_history: boolean;
    message: string;
    meter_record: {
      id: string;
      metered_at: string;
      used_bytes: number;
      used_gb: string;
      calculated_credits: string;
    };
    total_files: number;
    total_storage_bytes: number;
    formatted_total_storage: string;
    accounting_difference_bytes: number;
    files: Array<{
      id: string;
      original_filename: string;
      display_name: string;
      file_type: string;
      media_type: string;
      size_bytes: number;
      formatted_size: string;
      created_at: string | null;
      uploaded_at: string | null;
    }>;
  }> {
    const response = await apiClient.get(`/api/v1/storage/meter-logs/${meterId}/files/`);
    return response.data?.data || response.data;
  },
};

export const mediaService = storageService;

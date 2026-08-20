import { apiClient } from '../api/client';

export interface StorageEstimateRequest {
  size_bytes: number;
  category?: string;
}

export interface StorageEstimateResponse {
  file_size_bytes: number;
  file_size_display: string;
  price_per_unit: number;
  storage_unit: string;
  additional_monthly_cost: number;
  current_storage_usage: string;
  estimated_new_usage: string;
  currency: string;
  category: string;
}

export const storageService = {
  async getEstimate(payload: StorageEstimateRequest): Promise<StorageEstimateResponse> {
    const response = await apiClient.post<{ data: StorageEstimateResponse } | StorageEstimateResponse>(
      '/api/v1/storage/estimate/',
      payload
    );
    return (response.data as { data?: StorageEstimateResponse })?.data || (response.data as StorageEstimateResponse);
  },

  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/v1/storage/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  async listMediaFiles(): Promise<any[]> {
    const response = await apiClient.get('/api/v1/storage/files/');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && data.results && Array.isArray(data.results)) return data.results;
    return [];
  },

  async deleteMediaFile(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/storage/files/${id}/`);
  },
};

export interface NormalizedApiError {
  status?: number;
  code?: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  isNetworkError?: boolean;
  isTimeout?: boolean;
}

export interface BackendApiResponse<T = any> {
  success?: boolean;
  message?: string;
  code?: string;
  data?: T;
  errors?: Record<string, string[]>;
  detail?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

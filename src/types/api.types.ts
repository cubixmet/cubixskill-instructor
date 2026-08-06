export interface ApiErrorResponse {
  message?: string;
  detail?: string;
  code?: string;
  errors?: Record<string, string[] | string>;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

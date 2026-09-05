import axios, { AxiosRequestConfig } from "axios";
import { setupInterceptors } from "./interceptors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for file uploads
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Portal": "instructor",
  },
});

setupInterceptors(apiClient);

// Explicit helper for Multipart FormData Requests
export async function postForm<T = any>(
  endpoint: string,
  formData: FormData,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(endpoint, formData, {
    ...config,
    headers: {
      ...config?.headers,
      // Do not set Content-Type manually so browser generates boundary string
    },
  });
  return response.data;
}

export default apiClient;


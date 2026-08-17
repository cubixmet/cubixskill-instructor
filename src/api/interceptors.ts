import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "../features/auth/utils/token-storage";
import { parseApiError } from "./errors";
import { API_ENDPOINTS } from "./endpoints";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (client: AxiosInstance) => {
  // Request Interceptor
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(parseApiError(error))
  );

  // Response Interceptor
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Check if authentication route to bypass refresh attempt loop
      const isAuthBypassRoute =
        originalRequest?.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
        originalRequest?.url?.includes(API_ENDPOINTS.AUTH.LOGOUT) ||
        originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REFRESH) ||
        originalRequest?.url?.includes(API_ENDPOINTS.AUTH.FORGOT_PASSWORD) ||
        originalRequest?.url?.includes(API_ENDPOINTS.AUTH.RESET_PASSWORD);

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthBypassRoute) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            })
            .catch((err) => Promise.reject(parseApiError(err)));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = tokenStorage.getRefreshToken();

        if (!refreshToken) {
          isRefreshing = false;
          tokenStorage.clearTokens();
          window.location.href = "/login";
          return Promise.reject(parseApiError(error));
        }

        try {
          const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
            refresh: refreshToken,
          });

          const data = response.data?.data || response.data;
          const newAccessToken = data.access || data.access_token;
          const newRefreshToken = data.refresh || data.refresh_token;

          if (!newAccessToken) {
            throw new Error("No access token returned from refresh endpoint.");
          }

          tokenStorage.setAccessToken(newAccessToken);
          if (newRefreshToken) {
            tokenStorage.setRefreshToken(newRefreshToken);
          }

          client.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          tokenStorage.clearTokens();
          window.location.href = "/login";
          return Promise.reject(parseApiError(refreshError));
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(parseApiError(error));
    }
  );
};

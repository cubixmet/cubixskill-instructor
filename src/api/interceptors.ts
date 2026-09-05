import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "../features/auth/utils/token-storage";
import { parseApiError } from "./errors";
import { API_ENDPOINTS } from "./endpoints";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let refreshPromise: Promise<boolean> | null = null;

export const setupInterceptors = (client: AxiosInstance) => {
  // Request Interceptor: Ensure FormData requests automatically generate boundary headers
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (config.data instanceof FormData && config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
      return config;
    },
    (error) => Promise.reject(parseApiError(error))
  );

  // Response Interceptor: Handle 401 errors with cookie-based token refresh & request retry
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Do not attempt refresh on login/logout/refresh/password reset auth endpoints
      const requestUrl = originalRequest?.url || "";
      const isAuthBypassRoute =
        requestUrl.includes(API_ENDPOINTS.AUTH.LOGIN) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.LOGOUT) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.REFRESH) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.FORGOT_PASSWORD) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.RESET_PASSWORD);

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isAuthBypassRoute
      ) {
        originalRequest._retry = true;

        if (!refreshPromise) {
          refreshPromise = (async () => {
            try {
              console.debug("API 401 encountered, refreshing session cookie...");
              const refreshUrl = `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`;
              await axios.post(refreshUrl, {}, {
                withCredentials: true,
                headers: { "X-Portal": "instructor" }
              });
              console.debug("Session cookie refresh succeeded");
              return true;
            } catch (refreshErr) {
              tokenStorage.clearTokens();
              throw refreshErr;
            } finally {
              refreshPromise = null;
            }
          })();
        }

        try {
          await refreshPromise;
          console.debug("Retrying original request after cookie refresh:", requestUrl);
          originalRequest.withCredentials = true;
          if (originalRequest.data instanceof FormData && originalRequest.headers) {
            delete originalRequest.headers['Content-Type'];
            delete originalRequest.headers['content-type'];
          }
          return client(originalRequest);
        } catch (retryErr) {
          return Promise.reject(parseApiError(retryErr));
        }
      }

      return Promise.reject(parseApiError(error));
    }
  );
};

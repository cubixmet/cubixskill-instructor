import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "../features/auth/utils/token-storage";
import { parseApiError } from "./errors";
import { API_ENDPOINTS } from "./endpoints";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let refreshPromise: Promise<string> | null = null;

export const setupInterceptors = (client: AxiosInstance) => {
  // Request Interceptor: Attach current access token to every request
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const accessToken = tokenStorage.getAccessToken();
      if (accessToken && config.headers) {
        if (typeof config.headers.set === "function") {
          config.headers.set("Authorization", `Bearer ${accessToken}`);
        } else {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(parseApiError(error))
  );

  // Response Interceptor: Handle 401 errors with token refresh & request retry
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Do not attempt refresh on auth endpoints (login, logout, refresh, password reset)
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
            const refreshToken = tokenStorage.getRefreshToken();

            if (!refreshToken) {
              tokenStorage.clearTokens();
              window.location.href = "/login";
              throw new Error("No refresh token available");
            }

            try {
              console.debug("API 401:", requestUrl);
              console.debug("Refreshing access token...");

              const refreshUrl = `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`;
              const response = await axios.post(refreshUrl, { refresh: refreshToken });

              console.debug("Refresh succeeded");

              const payload = response.data?.data ?? response.data;
              const newAccessToken = payload?.access ?? payload?.access_token;
              const newRefreshToken = payload?.refresh ?? payload?.refresh_token;

              if (!newAccessToken) {
                throw new Error("No access token returned from refresh endpoint.");
              }

              tokenStorage.setAccessToken(newAccessToken);
              if (newRefreshToken) {
                tokenStorage.setRefreshToken(newRefreshToken);
              }

              client.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

              return newAccessToken;
            } catch (refreshErr) {
              tokenStorage.clearTokens();
              window.location.href = "/login";
              throw refreshErr;
            } finally {
              refreshPromise = null;
            }
          })();
        }

        try {
          const newAccessToken = await refreshPromise;
          console.debug("Retrying:", requestUrl);

          if (originalRequest.headers) {
            if (typeof originalRequest.headers.set === "function") {
              originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
            } else {
              originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            }
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

import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../api/auth.api";
import { authStore } from "../../../store/auth.store";
import type { LoginPayload } from "../types/auth.types";
import { formatAuthError } from "../utils/auth-errors";
import { AUTH_MESSAGES } from "../constants/auth.constants";

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const data = await authApi.login(payload);
      
      if (!data.user) {
        throw new Error("Invalid response from server.");
      }

      if (data.user.role !== "instructor") {
        throw new Error(AUTH_MESSAGES.UNAUTHORIZED_ROLE);
      }

      if (!data.user.is_active) {
        throw new Error(AUTH_MESSAGES.INACTIVE_USER);
      }

      authStore.setSession(data.user, data.access_token, data.refresh_token);
      return data;
    },
    onError: (error: unknown) => {
      const formatted = formatAuthError(error);
      authStore.setError(formatted);
    },
  });
}

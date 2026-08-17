import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../api/auth.api";
import { authStore } from "../../../store/auth.store";
import type { LoginPayload, UserRole } from "../types/auth.types";
import { formatAuthError } from "../utils/auth-errors";
import { AUTH_MESSAGES } from "../constants/auth.constants";

const ALLOWED_ROLES: UserRole[] = ["ACADEMY_ADMIN", "ACADEMY_STAFF"];

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const data = await authApi.login(payload);

      if (!data || !data.user || !data.access) {
        throw new Error("Invalid response from server.");
      }

      if (!ALLOWED_ROLES.includes(data.user.role)) {
        throw new Error(AUTH_MESSAGES.UNAUTHORIZED_ROLE);
      }

      authStore.setSession(data.user, data.access, data.refresh);
      return data;
    },
    onError: (error: unknown) => {
      const formatted = formatAuthError(error);
      authStore.setError(formatted);
    },
  });
}


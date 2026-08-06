import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../api/auth.api";
import type { ForgotPasswordPayload } from "../types/auth.types";

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      return await authApi.forgotPassword(payload);
    },
  });
}

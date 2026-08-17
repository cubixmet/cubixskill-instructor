import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../api/auth.api";
import type { ResetPasswordPayload, ResetPasswordResponse } from "../types/auth.types";

export function useResetPassword() {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordPayload>({
    mutationFn: (payload) => authApi.resetPassword(payload),
  });
}

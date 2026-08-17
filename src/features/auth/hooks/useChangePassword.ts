import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../api/auth.api";
import type { ChangePasswordPayload, ChangePasswordResponse } from "../types/auth.types";

export function useChangePassword() {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordPayload>({
    mutationFn: (payload) => authApi.changePassword(payload),
  });
}

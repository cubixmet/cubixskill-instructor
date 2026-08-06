import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../api/auth.api";
import type { SetupPasswordPayload } from "../types/auth.types";

export function useSetupPassword() {
  return useMutation({
    mutationFn: async (payload: SetupPasswordPayload) => {
      return await authApi.setupPassword(payload);
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../../api/auth.api";

export function useValidatePasswordToken(token: string | null) {
  return useQuery({
    queryKey: ["validate-password-token", token],
    queryFn: async () => {
      if (!token) throw new Error("Token is missing");
      return await authApi.validatePasswordToken(token);
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: 0,
  });
}

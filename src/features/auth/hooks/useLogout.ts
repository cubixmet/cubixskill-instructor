import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "../../../store/auth.store";

export function useLogout() {
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      await authStore.logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return { logout };
}

import { useAuthStore } from "../../../store/auth.store";

export function useAuth() {
  const authState = useAuthStore();
  return {
    user: authState.user,
    accessToken: authState.accessToken,
    refreshToken: authState.refreshToken,
    isAuthenticated: authState.isAuthenticated,
    isInitializing: authState.isInitializing,
    error: authState.error,
    logout: authState.logout,
    clearError: () => authState.setError(null),
  };
}

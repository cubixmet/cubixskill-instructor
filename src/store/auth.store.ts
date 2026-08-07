import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "../features/auth/types/auth.types";
import { tokenStorage } from "../features/auth/utils/token-storage";
import { authApi } from "../api/auth.api";
import { queryClient } from "../lib/query-client";
import { AUTH_MESSAGES } from "../features/auth/constants/auth.constants";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  error: string | null;
}

const STORAGE_USER_KEY = "cubixskill_auth_user";

class AuthStore {
  private state: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isInitializing: true,
    error: null,
  };

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  public getState(): AuthState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private setState(partialState: Partial<AuthState>) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  public async init() {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();
    const storedUserJson = localStorage.getItem(STORAGE_USER_KEY);

    let storedUser: AuthUser | null = null;
    if (storedUserJson) {
      try {
        storedUser = JSON.parse(storedUserJson);
      } catch (_) {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    }

    if (accessToken && refreshToken) {
      try {
        let user = storedUser;
        // Attempt to validate/fetch current user from backend
        try {
          user = await authApi.getCurrentUser();
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
        } catch (err) {
          // If network error, fall back to cached user if valid
          if (!user) {
            throw err;
          }
        }

        if (user && user.role === "instructor" && user.is_active) {
          this.setState({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isInitializing: false,
            error: null,
          });
          return;
        } else if (user && user.role !== "instructor") {
          this.clearSession(AUTH_MESSAGES.UNAUTHORIZED_ROLE);
          return;
        } else if (user && !user.is_active) {
          this.clearSession(AUTH_MESSAGES.INACTIVE_USER);
          return;
        }
      } catch (_) {
        this.clearSession();
        return;
      }
    }

    this.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  }

  public setSession(user: AuthUser, accessToken: string, refreshToken: string) {
    if (user.role !== "instructor") {
      this.clearSession(AUTH_MESSAGES.UNAUTHORIZED_ROLE);
      throw new Error(AUTH_MESSAGES.UNAUTHORIZED_ROLE);
    }

    if (!user.is_active) {
      this.clearSession(AUTH_MESSAGES.INACTIVE_USER);
      throw new Error(AUTH_MESSAGES.INACTIVE_USER);
    }

    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));

    this.setState({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isInitializing: false,
      error: null,
    });
  }

  public clearSession(errorMessage: string | null = null) {
    const refreshToken = this.state.refreshToken || tokenStorage.getRefreshToken();
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }

    tokenStorage.clearTokens();
    localStorage.removeItem(STORAGE_USER_KEY);
    queryClient.clear();

    this.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitializing: false,
      error: errorMessage,
    });
  }

  public setError(error: string | null) {
    this.setState({ error });
  }
}

export const authStore = new AuthStore();

export function useAuthStore() {
  const [state, setState] = useState<AuthState>(authStore.getState());

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setState(authStore.getState());
    });
    return unsubscribe;
  }, []);

  const logout = useCallback(() => {
    authStore.clearSession();
  }, []);

  return {
    ...state,
    logout,
    setSession: authStore.setSession.bind(authStore),
    clearSession: authStore.clearSession.bind(authStore),
    setError: authStore.setError.bind(authStore),
  };
}

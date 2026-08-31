import { useSyncExternalStore, useCallback } from "react";
import type {
  AuthUser,
  AcademyContext,
  DemoStatus,
  UserRole,
  AuthBootstrapData,
} from "../features/auth/types/auth.types";
import { tokenStorage } from "../features/auth/utils/token-storage";
import { authApi } from "../api/auth.api";
import { queryClient } from "../lib/query-client";
import { AUTH_MESSAGES } from "../features/auth/constants/auth.constants";
import { updateBrowserFavicon, applyThemeColor } from "../utils/branding.utils";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export interface AuthState {
  user: AuthUser | null;
  academy: AcademyContext | null;
  role: UserRole | string | null;
  permissions: string[];
  features: Record<string, boolean>;
  demoStatus: DemoStatus | null;
  accessToken: string | null;
  refreshToken: string | null;
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoadingAcademyProfile: boolean;
  error: string | null;
}

const STORAGE_BOOTSTRAP_KEY = "cubixskill_auth_bootstrap";

class AuthStore {
  private state: AuthState = {
    user: null,
    academy: null,
    role: null,
    permissions: [],
    features: {},
    demoStatus: null,
    accessToken: null,
    refreshToken: null,
    authStatus: "checking",
    isAuthenticated: false,
    isInitializing: true,
    isLoadingAcademyProfile: false,
    error: null,
  };

  private listeners: Set<() => void> = new Set();
  private initPromise: Promise<void> | null = null;

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

  private applyBranding(academy?: AcademyContext | null) {
    if (!academy) return;
    if (academy.favicon_url) {
      updateBrowserFavicon(academy.favicon_url);
    }
    if (academy.theme_color) {
      applyThemeColor(academy.theme_color);
    }
  }

  public async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      // Clear any legacy JWTs from localStorage
      tokenStorage.clearTokens();

      const storedCacheJson = localStorage.getItem(STORAGE_BOOTSTRAP_KEY);
      if (storedCacheJson) {
        try {
          const cachedData: AuthBootstrapData = JSON.parse(storedCacheJson);
          if (cachedData?.academy) {
            this.applyBranding(cachedData.academy);
          }
        } catch (_) {
          localStorage.removeItem(STORAGE_BOOTSTRAP_KEY);
        }
      }

      try {
        const bootstrap = await authApi.getCurrentUser();
        const user = bootstrap.user;
        const isAllowedRole = (r?: string) =>
          r === "ACADEMY_ADMIN" || r === "ACADEMY_STAFF" || r === "SUPER_ADMIN" || r === "SUPER_ADMIN_STAFF";

        if (user && isAllowedRole(user.role) && (user.is_active ?? true)) {
          let academy = bootstrap.academy;

          try {
            this.setState({ isLoadingAcademyProfile: true });
            const academyProfile = await authApi.getAcademyProfile();
            if (academyProfile) {
              academy = { ...academy, ...academyProfile };
            }
          } catch (_) {
            // Non-critical profile enrichment failure
          }

          this.applyBranding(academy);

          const updatedBootstrap: AuthBootstrapData = {
            ...bootstrap,
            academy,
          };

          localStorage.setItem(STORAGE_BOOTSTRAP_KEY, JSON.stringify(updatedBootstrap));

          this.setState({
            user,
            academy,
            role: user.role,
            permissions: bootstrap.permissions || [],
            features: bootstrap.features || {},
            demoStatus: bootstrap.demo_status,
            accessToken: null,
            refreshToken: null,
            authStatus: "authenticated",
            isAuthenticated: true,
            isInitializing: false,
            isLoadingAcademyProfile: false,
            error: null,
          });
          return;
        } else if (user && !isAllowedRole(user.role)) {
          this.clearSession(AUTH_MESSAGES.UNAUTHORIZED_ROLE);
          return;
        } else if (user && user.is_active === false) {
          this.clearSession(AUTH_MESSAGES.INACTIVE_USER);
          return;
        }
      } catch (_) {
        this.clearSession();
        return;
      } finally {
        // Guaranteed terminal state resolution: never leave authStatus at "checking" or isInitializing: true
        if (this.state.isInitializing || this.state.authStatus === "checking") {
          const isAuth = Boolean(this.state.user && this.state.isAuthenticated);
          this.setState({
            isInitializing: false,
            authStatus: isAuth ? "authenticated" : "unauthenticated",
            isAuthenticated: isAuth,
            isLoadingAcademyProfile: false,
          });
        }
      }
    })();

    return this.initPromise;
  }

  public async setSession(user: AuthUser) {
    const isAllowedRole =
      user.role === "ACADEMY_ADMIN" || user.role === "ACADEMY_STAFF" || user.role === "SUPER_ADMIN" || user.role === "SUPER_ADMIN_STAFF";
    if (!isAllowedRole) {
      this.clearSession(AUTH_MESSAGES.UNAUTHORIZED_ROLE);
      throw new Error(AUTH_MESSAGES.UNAUTHORIZED_ROLE);
    }

    if (user.is_active === false) {
      this.clearSession(AUTH_MESSAGES.INACTIVE_USER);
      throw new Error(AUTH_MESSAGES.INACTIVE_USER);
    }

    this.setState({
      user,
      role: user.role,
      accessToken: null,
      refreshToken: null,
      authStatus: "authenticated",
      isAuthenticated: true,
      isInitializing: false,
      isLoadingAcademyProfile: true,
      error: null,
    });

    try {
      const bootstrap = await authApi.getCurrentUser();

      let academy = bootstrap.academy;
      const academyProfile = await authApi.getAcademyProfile();
      if (academyProfile) {
        academy = { ...academy, ...academyProfile };
      }
      this.applyBranding(academy);

      const updatedBootstrap: AuthBootstrapData = {
        ...bootstrap,
        academy,
      };

      localStorage.setItem(STORAGE_BOOTSTRAP_KEY, JSON.stringify(updatedBootstrap));

      this.setState({
        user: bootstrap.user,
        academy,
        role: bootstrap.user.role,
        permissions: bootstrap.permissions || [],
        features: bootstrap.features || {},
        demoStatus: bootstrap.demo_status,
        authStatus: "authenticated",
        isAuthenticated: true,
        isInitializing: false,
        isLoadingAcademyProfile: false,
      });
    } catch (_) {
      this.setState({ isLoadingAcademyProfile: false });
    }
  }

  public async logout(errorMessage: string | null = null) {
    try {
      await authApi.logout();
    } catch (_) {
      // Silently catch errors if cookie was already cleared or expired
    }

    this.clearSession(errorMessage);
  }

  public clearSession(errorMessage: string | null = null) {
    tokenStorage.clearTokens();
    localStorage.removeItem(STORAGE_BOOTSTRAP_KEY);
    queryClient.clear();

    this.setState({
      user: null,
      academy: null,
      role: null,
      permissions: [],
      features: {},
      demoStatus: null,
      accessToken: null,
      refreshToken: null,
      authStatus: "unauthenticated",
      isAuthenticated: false,
      isInitializing: false,
      isLoadingAcademyProfile: false,
      error: errorMessage,
    });
  }

  public setError(error: string | null) {
    this.setState({ error });
  }

  // Central Access Control Helpers
  public can(permission: string): boolean {
    const { user, permissions } = this.state;
    if (!user || !this.state.isAuthenticated) return false;
    if (user.role === "ACADEMY_ADMIN" || user.role === "SUPER_ADMIN") return true;
    return permissions.includes(permission);
  }

  public canAny(permissionsList: string[]): boolean {
    return permissionsList.some((p) => this.can(p));
  }

  public canAll(permissionsList: string[]): boolean {
    return permissionsList.every((p) => this.can(p));
  }

  public hasRole(requiredRole: UserRole | string | (UserRole | string)[]): boolean {
    const { user } = this.state;
    if (!user || !this.state.isAuthenticated) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  }

  public hasFeature(featureKey: string): boolean {
    const { features } = this.state;
    if (!features || Object.keys(features).length === 0) return true;
    return features[featureKey] !== false;
  }
}

export const authStore = new AuthStore();

export function useAuthStore() {
  const state = useSyncExternalStore(
    (listener) => authStore.subscribe(listener),
    () => authStore.getState()
  );

  const logout = useCallback(async () => {
    await authStore.logout();
  }, []);

  const can = useCallback((permission: string) => authStore.can(permission), []);
  const canAny = useCallback((permissions: string[]) => authStore.canAny(permissions), []);
  const canAll = useCallback((permissions: string[]) => authStore.canAll(permissions), []);
  const hasRole = useCallback((role: UserRole | string | (UserRole | string)[]) => authStore.hasRole(role), []);
  const hasFeature = useCallback((feature: string) => authStore.hasFeature(feature), []);

  return {
    ...state,
    logout,
    can,
    canAny,
    canAll,
    hasRole,
    hasFeature,
    setSession: authStore.setSession.bind(authStore),
    clearSession: authStore.clearSession.bind(authStore),
    setError: authStore.setError.bind(authStore),
  };
}

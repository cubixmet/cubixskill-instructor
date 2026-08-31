export const ACCESS_TOKEN_KEY = "cubixskill_access_token";
export const REFRESH_TOKEN_KEY = "cubixskill_refresh_token";

export const tokenStorage = {
  getAccessToken(): string | null {
    return null;
  },

  setAccessToken(_token: string): void {
    // No-op: Auth uses HttpOnly backend cookies
  },

  removeAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return null;
  },

  setRefreshToken(_token: string): void {
    // No-op: Auth uses HttpOnly backend cookies
  },

  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem("cubixskill_auth_bootstrap");
  },
};

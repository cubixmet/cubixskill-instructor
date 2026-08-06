import { api } from "../lib/api";
import authMock from "./mock/auth.json";
import type {
  LoginPayload,
  LoginResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  SetupPasswordPayload,
  TokenValidationResponse,
  AuthUser,
} from "../features/auth/types/auth.types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true" || true; // Development mode toggle

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    if (USE_MOCK) {
      if (payload.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      return {
        ...authMock.loginResponse,
        user: {
          ...authMock.loginResponse.user,
          email: payload.email,
          full_name: payload.email.split("@")[0].replace(".", " ").toUpperCase() || "Demo Instructor",
          role: "instructor",
          is_active: true,
        },
      };
    }
    const response = await api.post<LoginResponse>("/api/auth/login/", payload);
    return response.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    if (USE_MOCK) {
      return { message: `Password setup link sent to ${payload.email}` };
    }
    const response = await api.post<ForgotPasswordResponse>("/api/auth/forgot-password/", payload);
    return response.data;
  },

  async validatePasswordToken(token: string): Promise<TokenValidationResponse> {
    if (USE_MOCK) {
      return authMock.tokenValidationResponse;
    }
    const response = await api.post<TokenValidationResponse>("/api/auth/validate-password-token/", { token });
    return response.data;
  },

  async setupPassword(payload: SetupPasswordPayload): Promise<{ message: string }> {
    if (USE_MOCK) {
      return authMock.setupPasswordResponse;
    }
    const response = await api.post<{ message: string }>("/api/auth/setup-password/", payload);
    return response.data;
  },

  async logout(refreshToken: string): Promise<{ message: string }> {
    if (USE_MOCK) {
      return authMock.logoutResponse;
    }
    const response = await api.post<{ message: string }>("/api/auth/logout/", { refresh_token: refreshToken });
    return response.data;
  },

  async getCurrentUser(): Promise<AuthUser> {
    if (USE_MOCK) {
      return authMock.loginResponse.user as AuthUser;
    }
    const response = await api.get<AuthUser>("/api/auth/me/");
    return response.data;
  },
};

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { BackendApiResponse } from "../api/types";
import type {
  LoginPayload,
  LoginResponseData,
  ForgotPasswordPayload,
  ResetPayload,
  ChangePasswordPayload,
  SetupPasswordPayload,
  AuthUser,
} from "../features/auth/types/auth.types";

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponseData> {
    const response = await apiClient.post<BackendApiResponse<LoginResponseData>>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        email: payload.email,
        password: payload.password,
      }
    );
    return response.data?.data || (response.data as unknown as LoginResponseData);
  },

  async logout(refreshToken: string): Promise<{ message: string }> {
    const response = await apiClient.post<BackendApiResponse<null>>(API_ENDPOINTS.AUTH.LOGOUT, {
      refresh: refreshToken,
    });
    return { message: response.data?.message || "Successfully logged out." };
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<BackendApiResponse<AuthUser>>(API_ENDPOINTS.AUTH.ME);
    return response.data?.data || (response.data as unknown as AuthUser);
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<BackendApiResponse<null>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email: payload.email,
    });
    return {
      success: response.data?.success ?? true,
      message: response.data?.message || "If an account with that email exists, a password reset link has been sent.",
    };
  },

  async resetPassword(payload: ResetPayload): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<BackendApiResponse<null>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token: payload.token,
      new_password: payload.new_password,
      confirm_password: payload.confirm_password,
    });
    return {
      success: response.data?.success ?? true,
      message: response.data?.message || "Password reset successfully. You can now login with your new password.",
    };
  },

  async changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<BackendApiResponse<null>>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      current_password: payload.current_password,
      new_password: payload.new_password,
      confirm_password: payload.confirm_password,
    });
    return {
      success: response.data?.success ?? true,
      message: response.data?.message || "Password changed successfully.",
    };
  },

  async validatePasswordToken(token: string): Promise<{ valid: boolean }> {
    try {
      const response = await apiClient.post<BackendApiResponse<{ valid: boolean }>>(
        API_ENDPOINTS.AUTH.VALIDATE_TOKEN,
        { token }
      );
      const data = response.data?.data || response.data;
      return {
        valid: (data as any)?.valid ?? true,
      };
    } catch (_) {
      return { valid: false };
    }
  },

  async setupPassword(payload: SetupPasswordPayload): Promise<LoginResponseData> {
    const response = await apiClient.post<BackendApiResponse<LoginResponseData>>(API_ENDPOINTS.AUTH.SETUP_PASSWORD, payload);
    return response.data?.data || (response.data as unknown as LoginResponseData);
  },

  async resendActivationEmail(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<BackendApiResponse<null>>(API_ENDPOINTS.AUTH.RESEND_EMAIL, { email });
    return { message: response.data?.message || "If account exists and is unverified, an activation email has been sent." };
  },
};

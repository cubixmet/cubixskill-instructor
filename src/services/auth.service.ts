import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { BackendApiResponse } from "../api/types";
import type {
  LoginPayload,
  LoginResponseData,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  SetupPasswordPayload,
  AuthUser,
  AuthBootstrapData,
  AcademyContext,
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

  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<BackendApiResponse<null>>(API_ENDPOINTS.AUTH.LOGOUT, {});
    return { message: response.data?.message || "Successfully logged out." };
  },

  async getCurrentUser(): Promise<AuthBootstrapData> {
    const response = await apiClient.get<BackendApiResponse<AuthBootstrapData>>(API_ENDPOINTS.AUTH.ME);
    const data = response.data?.data || (response.data as unknown as AuthBootstrapData);

    if ((data as any)?.id && !(data as any)?.user) {
      return {
        user: data as unknown as AuthUser,
        academy: null,
        permissions: [],
        features: {},
        demo_status: null,
      };
    }
    return data;
  },

  async getAcademyProfile(): Promise<AcademyContext | null> {
    try {
      const response = await apiClient.get<BackendApiResponse<any>>(API_ENDPOINTS.ACADEMY.PROFILE);
      const rawData = response.data?.data || response.data;
      if (!rawData || typeof rawData !== "object" || !rawData.name) return null;

      const extractUrl = (mediaObj: any): string | null => {
        if (!mediaObj) return null;
        if (typeof mediaObj === "string") return mediaObj;
        if (mediaObj.url) return mediaObj.url;
        if (mediaObj.file) {
          if (typeof mediaObj.file === "string") return mediaObj.file;
          if (mediaObj.file.url) return mediaObj.file.url;
        }
        return null;
      };

      const logoUrl = rawData.logo_url || extractUrl(rawData.logo);
      const faviconUrl = rawData.favicon_url || extractUrl(rawData.favicon);

      return {
        id: rawData.id,
        name: rawData.name,
        slug: rawData.slug,
        email: rawData.email,
        phone: rawData.phone || "",
        theme: rawData.theme || "default",
        theme_color: rawData.theme_color || "#3B82F6",
        status: rawData.status || "ACTIVE",
        is_active: rawData.is_active ?? true,
        logo_url: logoUrl,
        favicon_url: faviconUrl,
      };
    } catch (_) {
      return null;
    }
  },

  async updateUserProfile(payload: { full_name?: string; phone?: string }): Promise<any> {
    const response = await apiClient.patch('/api/v1/auth/me/', payload);
    return response.data;
  },

  async updateAcademyProfile(payload: { name?: string; email?: string; phone?: string; theme_color?: string }): Promise<any> {
    const response = await apiClient.patch('/api/v1/academy/profile/', payload);
    return response.data?.data || response.data;
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

  async resetPassword(payload: ResetPasswordPayload): Promise<LoginResponseData> {
    const response = await apiClient.post<BackendApiResponse<LoginResponseData>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token: payload.token,
      new_password: payload.new_password,
      confirm_password: payload.confirm_password,
    });
    return response.data?.data || (response.data as unknown as LoginResponseData);
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

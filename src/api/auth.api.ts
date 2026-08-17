import { authService } from "../services/auth.service";
import type {
  LoginPayload,
  LoginResponseData,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  SetupPasswordPayload,
  TokenValidationResponse,
  AuthUser,
} from "../features/auth/types/auth.types";

export const authApi = {
  login: (payload: LoginPayload): Promise<LoginResponseData> => authService.login(payload),
  logout: (refreshToken: string): Promise<{ message: string }> => authService.logout(refreshToken),
  getCurrentUser: (): Promise<AuthUser> => authService.getCurrentUser(),
  forgotPassword: (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => authService.forgotPassword(payload),
  resetPassword: (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => authService.resetPassword(payload),
  changePassword: (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> => authService.changePassword(payload),
  validatePasswordToken: (token: string): Promise<TokenValidationResponse> => authService.validatePasswordToken(token),
  setupPassword: (payload: SetupPasswordPayload): Promise<LoginResponseData> => authService.setupPassword(payload),
  resendActivationEmail: (email: string): Promise<{ message: string }> => authService.resendActivationEmail(email),
};

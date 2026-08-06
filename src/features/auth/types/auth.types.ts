export type UserRole = "instructor";

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface SetupPasswordPayload {
  token: string;
  password: string;
  confirm_password: string;
}

export interface TokenValidationPayload {
  token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  message?: string;
}

export interface LogoutPayload {
  refresh_token: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  fieldErrors?: Record<string, string>;
}

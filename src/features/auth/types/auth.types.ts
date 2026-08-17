export type UserRole = "ACADEMY_ADMIN" | "ACADEMY_STAFF";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole | string;
  academy_id: string | null;
  is_email_verified?: boolean;
  is_active?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponseData {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  success?: boolean;
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  success?: boolean;
  message: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  success?: boolean;
  message: string;
}

export interface SetupPasswordPayload {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface TokenValidationPayload {
  token: string;
}

export interface TokenValidationResponse {
  valid?: boolean;
  message?: string;
  password_setup_token?: string;
}


export interface LogoutPayload {
  refresh: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  fieldErrors?: Record<string, string>;
}



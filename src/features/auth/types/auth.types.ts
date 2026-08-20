export type UserRole = "ACADEMY_ADMIN" | "ACADEMY_STAFF" | "SUPER_ADMIN" | "SUPER_ADMIN_STAFF" | "STUDENT";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole | string;
  assigned_role_name?: string | null;
  academy_id: string | null;
  is_email_verified?: boolean;
  is_active?: boolean;
  password_setup_completed?: boolean;
  last_login?: string | null;
}

export interface AcademyContext {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  theme?: string;
  theme_color?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;
  is_active: boolean;
  logo_url?: string | null;
  favicon_url?: string | null;
}

export interface DemoStatus {
  is_demo: boolean;
  status: "ACTIVE" | "EXPIRED" | "NOT_DEMO" | string;
  is_expired: boolean;
  days_remaining: number | null;
  start_date: string | null;
  expiry_date: string | null;
}

export interface AuthBootstrapData {
  user: AuthUser;
  academy: AcademyContext | null;
  permissions: string[];
  features: Record<string, boolean>;
  demo_status: DemoStatus | null;
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

export type ResetPasswordResponse = LoginResponseData;


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



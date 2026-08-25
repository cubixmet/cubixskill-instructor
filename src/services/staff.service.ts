import apiClient from '../api/client';

export interface BackendStaffUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role_code: string;
  assigned_role?: string;
  assigned_role_detail?: BackendRole;
  course_access_scope?: 'ALL' | 'SELECTED';
  assigned_course_ids?: string[];
  academy?: string;
  is_active: boolean;
  is_email_verified: boolean;
  password_setup_completed: boolean;
  last_login?: string;
  created_at: string;
}

export interface StaffSummary {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  staff: number;
}

export interface BackendRole {
  id: string;
  name: string;
  code: string;
  description: string;
  scope?: string;
  is_system_role?: boolean;
  is_active?: boolean;
  permissions?: Array<{
    id?: string;
    permission?: {
      id: string;
      name: string;
      code: string;
      module: string;
      description: string;
    };
    code?: string;
    name?: string;
    module?: string;
  }>;
}

export interface PermissionGroup {
  module: string;
  permissions: Array<{
    id: string;
    code: string;
    name: string;
    description: string;
  }>;
}

export const staffService = {
  async getStaffMembers(params?: { search?: string; role?: string; status?: string }): Promise<BackendStaffUser[]> {
    const response = await apiClient.get<BackendStaffUser[]>('/api/v1/users/', { params });
    return response.data;
  },

  async getSummary(): Promise<StaffSummary> {
    const response = await apiClient.get<StaffSummary>('/api/v1/users/summary/');
    return response.data;
  },

  async getRoles(): Promise<BackendRole[]> {
    const response = await apiClient.get<BackendRole[]>('/api/v1/roles/');
    return response.data;
  },

  async createRole(payload: { name: string; description?: string; permission_codes?: string[] }): Promise<BackendRole> {
    const response = await apiClient.post<BackendRole>('/api/v1/roles/', payload);
    return response.data;
  },

  async getPermissionRegistry(): Promise<PermissionGroup[]> {
    const response = await apiClient.get<PermissionGroup[]>('/api/v1/permissions/registry/');
    return response.data;
  },

  async inviteStaffMember(payload: {
    email: string;
    full_name: string;
    phone?: string;
    role_code: string;
    assigned_role?: string;
    course_access_scope?: 'ALL' | 'SELECTED';
    course_ids?: string[];
  }): Promise<BackendStaffUser> {
    const response = await apiClient.post<BackendStaffUser>('/api/v1/users/', payload);
    return response.data;
  },

  async updateStaffMember(
    id: string,
    payload: Partial<{
      email: string;
      full_name: string;
      phone: string;
      role_code: string;
      assigned_role: string;
      course_access_scope: 'ALL' | 'SELECTED';
      course_ids: string[];
    }>
  ): Promise<BackendStaffUser> {
    const response = await apiClient.patch<BackendStaffUser>(`/api/v1/users/${id}/`, payload);
    return response.data;
  },

  async deactivateStaffMember(id: string): Promise<void> {
    await apiClient.post(`/api/v1/users/${id}/deactivate/`);
  },

  async activateStaffMember(id: string): Promise<void> {
    await apiClient.post(`/api/v1/users/${id}/activate/`);
  },

  async resendInvitation(id: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/api/v1/users/${id}/resend_invitation/`);
    return response.data;
  }
};

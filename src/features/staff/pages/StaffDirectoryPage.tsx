import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  UserPlus,
  Mail,
  BookOpen,
  Users,
  Edit3,
  UserX,
  UserCheck,
  ShieldCheck,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
  Check,
  X,
  Lock,
  PlusCircle,
  Key,
} from 'lucide-react';
import type { StaffMember } from '../../../types/models.types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { staffService, BackendStaffUser, StaffSummary, BackendRole, PermissionGroup } from '../../../services/staff.service';
import { coursesService } from '../../../services/courses.service';

const INITIAL_DEMO_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Vikramaditya Roy',
    email: 'vikram@cubixskill.com',
    phone: '+91 98765 43210',
    department: 'Academic Leadership',
    roleId: 'role-admin',
    roleName: 'Academy Admin',
    status: 'Active',
    assignedCoursesCount: 12,
    assignedStudentsCount: 450,
    creditCost: 0,
    lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'staff-2',
    name: 'Ananya Deshmukh',
    email: 'ananya@cubixskill.com',
    phone: '+91 98765 12345',
    department: 'Computer Science',
    roleId: 'role-staff',
    roleName: 'Academy Staff',
    status: 'Active',
    assignedCoursesCount: 6,
    assignedStudentsCount: 220,
    creditCost: 0,
    lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const MODULE_PERMISSIONS_PREVIEW: Record<string, { label: string; admin: boolean; staff: boolean }> = {
  Courses: { label: 'Course Management & Curriculum', admin: true, staff: true },
  Students: { label: 'Student Directory & Enrolments', admin: true, staff: true },
  LiveClasses: { label: 'Live Sessions & Classrooms', admin: true, staff: true },
  Discussions: { label: 'Discussion Forums & Chat', admin: true, staff: true },
  Certificates: { label: 'Certificate Issuance', admin: true, staff: true },
  Fees: { label: 'Fees & Payment Transactions', admin: true, staff: false },
  Coupons: { label: 'Coupons & Discount Rules', admin: true, staff: false },
  WebsiteBuilder: { label: 'Academy Website Builder', admin: true, staff: false },
  Staff: { label: 'Team Members & RBAC Roles', admin: true, staff: false },
};

const DEFAULT_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: 'Courses',
    permissions: [
      { id: 'p-1', code: 'courses.view', name: 'View Courses', description: 'View course catalog and modules' },
      { id: 'p-2', code: 'courses.create', name: 'Create Courses', description: 'Add new courses and curriculum' },
      { id: 'p-3', code: 'courses.edit', name: 'Edit Courses', description: 'Update course content and lessons' },
      { id: 'p-4', code: 'courses.publish', name: 'Publish Courses', description: 'Publish or unpublish courses' },
    ],
  },
  {
    module: 'Students',
    permissions: [
      { id: 'p-5', code: 'students.view', name: 'View Students', description: 'View enrolled student directory' },
      { id: 'p-6', code: 'students.create', name: 'Add Students', description: 'Enroll students into courses' },
      { id: 'p-7', code: 'students.edit', name: 'Edit Students', description: 'Update student profiles' },
    ],
  },
  {
    module: 'Live Classroom',
    permissions: [
      { id: 'p-8', code: 'live_classes.view', name: 'View Live Classes', description: 'Access live classroom schedules' },
      { id: 'p-9', code: 'live_classes.create', name: 'Create Live Classes', description: 'Schedule new live sessions' },
      { id: 'p-10', code: 'live_classes.manage', name: 'Manage Attendance', description: 'Moderate live sessions' },
    ],
  },
  {
    module: 'Fees & Payments',
    permissions: [
      { id: 'p-11', code: 'fees.view', name: 'View Fees', description: 'View fee ledger and transactions' },
      { id: 'p-12', code: 'fees.assign', name: 'Record Payments', description: 'Log student fee payments' },
      { id: 'p-13', code: 'fees.refund', name: 'Process Refunds', description: 'Process fee refunds' },
    ],
  },
  {
    module: 'Staff & Roles',
    permissions: [
      { id: 'p-14', code: 'staff.view', name: 'View Staff', description: 'View team directory' },
      { id: 'p-15', code: 'staff.edit', name: 'Manage Staff', description: 'Add and edit staff accounts' },
      { id: 'p-16', code: 'roles.create', name: 'Manage Roles', description: 'Create and edit custom access roles' },
    ],
  },
];

function initials(name: string) {
  if (!name) return 'ST';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatLastActive(iso?: string) {
  if (!iso) return 'Never';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Never';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const StaffDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_DEMO_STAFF);
  const [roles, setRoles] = useState<BackendRole[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(DEFAULT_PERMISSION_GROUPS);
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [metrics, setMetrics] = useState<StaffSummary>({ total: 2, active: 2, inactive: 0, admins: 1, staff: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search Debounce
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (search === debouncedSearch) return;
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  // Modals & Active Selections
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Add Staff Form States
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRoleCode, setInviteRoleCode] = useState('ACADEMY_STAFF');
  const [inviteAssignedRoleId, setInviteAssignedRoleId] = useState('');
  const [inviteDept, setInviteDept] = useState('');
  const [courseScope, setCourseScope] = useState<'ALL' | 'SELECTED'>('ALL');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [courseSearchInput, setCourseSearchInput] = useState('');

  // Create Role Form States
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPermCodes, setSelectedPermCodes] = useState<string[]>([
    'courses.view', 'students.view', 'live_classes.view'
  ]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch real staff members, summary metrics, roles, permissions, and courses
  const loadStaffData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const params: { search?: string; role?: string; status?: string } = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (filterRole !== 'all') params.role = filterRole;
      if (filterStatus !== 'all') params.status = filterStatus;

      const [data, summaryData, rolesData, permData, coursesData] = await Promise.all([
        staffService.getStaffMembers(params),
        staffService.getSummary().catch(() => null),
        staffService.getRoles().catch(() => []),
        staffService.getPermissionRegistry().catch(() => []),
        coursesService.listCourses().catch(() => []),
      ]);

      if (data && Array.isArray(data)) {
        const mapped: StaffMember[] = data
          .filter((u: BackendStaffUser) => u.role_code !== 'STUDENT')
          .map((u: BackendStaffUser) => ({
            id: u.id,
            name: u.full_name || u.email.split('@')[0],
            email: u.email,
            phone: u.phone || '',
            department: u.assigned_role || (u.role_code === 'ACADEMY_ADMIN' ? 'Administration' : 'Academic Staff'),
            roleId: u.assigned_role || `role-${u.role_code.toLowerCase()}`,
            roleName: u.assigned_role_detail?.name || (u.role_code === 'ACADEMY_ADMIN' ? 'Academy Admin' : 'Academy Staff'),
            status: u.is_active ? 'Active' : 'Inactive',
            assignedCoursesCount: u.assigned_course_ids?.length || (u.course_access_scope === 'ALL' ? 12 : 0),
            assignedStudentsCount: 120,
            creditCost: 0,
            lastActiveAt: u.last_login || u.created_at,
          }));
        setStaffList(mapped);
      }

      if (summaryData) {
        setMetrics(summaryData);
      } else if (data) {
        setMetrics({
          total: data.length,
          active: data.filter((u) => u.is_active).length,
          inactive: data.filter((u) => !u.is_active).length,
          admins: data.filter((u) => u.role_code === 'ACADEMY_ADMIN').length,
          staff: data.filter((u) => u.role_code === 'ACADEMY_STAFF').length,
        });
      }

      if (rolesData && Array.isArray(rolesData)) {
        setRoles(rolesData.filter((r) => r.code !== 'SUPER_ADMIN' && r.code !== 'SUPER_ADMIN_STAFF'));
      }

      if (permData && Array.isArray(permData) && permData.length > 0) {
        setPermissionGroups(permData);
      }

      if (coursesData) {
        const cList = Array.isArray(coursesData) ? coursesData : (coursesData as any)?.results || [];
        setAvailableCourses(cList.map((c: any) => ({ id: c.id, title: c.title })));
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || err?.message || 'Failed to load staff list.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filterRole, filterStatus]);

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  // Paginated list
  const totalPages = Math.ceil(staffList.length / itemsPerPage) || 1;
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return staffList.slice(start, start + itemsPerPage);
  }, [staffList, currentPage]);

  // Handle Invite / Add Staff
  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    try {
      await staffService.inviteStaffMember({
        email: inviteEmail.trim(),
        full_name: inviteName.trim(),
        phone: invitePhone.trim(),
        role_code: inviteRoleCode,
        assigned_role: inviteAssignedRoleId || inviteDept.trim() || undefined,
        course_access_scope: courseScope,
        course_ids: courseScope === 'SELECTED' ? selectedCourseIds : [],
      });

      showToast('Staff member created & invitation queued successfully!');
      setIsInviteOpen(false);
      resetForm();
      loadStaffData();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.email?.[0] || 'Failed to create staff member.';
      alert(msg);
    }
  };

  // Handle Create Custom Role
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const createdRole = await staffService.createRole({
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        permission_codes: selectedPermCodes,
      });

      showToast(`Custom role "${createdRole.name}" created successfully!`);
      setIsCreateRoleOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');

      // Refresh roles and auto-select newly created role
      const updatedRoles = await staffService.getRoles();
      setRoles(updatedRoles.filter((r) => r.code !== 'SUPER_ADMIN' && r.code !== 'SUPER_ADMIN_STAFF'));
      if (createdRole?.id) {
        setInviteAssignedRoleId(createdRole.id);
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to create role.');
    }
  };

  // Handle Edit Staff
  const handleSaveEdit = async () => {
    if (!editingStaff) return;
    try {
      const roleCode = editingStaff.roleName === 'Academy Admin' ? 'ACADEMY_ADMIN' : 'ACADEMY_STAFF';
      await staffService.updateStaffMember(editingStaff.id, {
        full_name: editingStaff.name,
        email: editingStaff.email,
        phone: editingStaff.phone,
        role_code: roleCode,
        assigned_role: editingStaff.department,
        course_access_scope: courseScope,
        course_ids: courseScope === 'SELECTED' ? selectedCourseIds : [],
      });

      showToast('Staff member updated successfully!');
      setEditingStaff(null);
      loadStaffData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to update staff member.');
    }
  };

  // Handle Deactivate / Reactivate
  const handleToggleActive = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'Active') {
        await staffService.deactivateStaffMember(id);
        showToast('Staff member deactivated successfully.');
      } else {
        await staffService.activateStaffMember(id);
        showToast('Staff member reactivated successfully.');
      }
      setDeactivateId(null);
      loadStaffData();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Cannot deactivate staff account.';
      alert(msg);
    }
  };

  // Handle Resend Invitation
  const handleResendInvite = async (id: string) => {
    try {
      await staffService.resendInvitation(id);
      showToast('Invitation email queued successfully!');
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to resend invitation.');
    }
  };

  const resetForm = () => {
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
    setInviteDept('');
    setInviteRoleCode('ACADEMY_STAFF');
    setInviteAssignedRoleId('');
    setCourseScope('ALL');
    setSelectedCourseIds([]);
  };

  const togglePermissionCode = (code: string) => {
    setSelectedPermCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const filteredCoursesForSelect = useMemo(() => {
    if (!courseSearchInput.trim()) return availableCourses;
    const q = courseSearchInput.toLowerCase().trim();
    return availableCourses.filter((c) => c.title.toLowerCase().includes(q));
  }, [availableCourses, courseSearchInput]);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip space-y-4 pb-24 md:pb-8 text-left font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0B1120] min-h-screen font-normal">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 bg-[#0F172A] dark:bg-[#1E293B] text-white font-medium text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[#334155] animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-0.5 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-tight truncate">
            Staff Management
          </h1>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-xs font-normal mt-0.5 truncate">
            Manage staff, roles, permissions and Course access.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link to="/roles/create" className="flex-1 sm:flex-initial">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<PlusCircle className="w-4 h-4 text-[var(--brand-primary)]" />}
              className="w-full sm:w-auto h-[44px] sm:h-[38px] min-h-[44px] sm:min-h-[38px] px-3.5 rounded-xl border-[var(--border)] dark:border-[#334155] bg-[var(--surface-secondary)] text-[var(--text-primary)] font-medium cursor-pointer flex items-center justify-center text-xs"
            >
              Create Role
            </Button>
          </Link>
          <Link to="/staff/create" className="flex-1 sm:flex-initial">
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              className="w-full sm:w-auto bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-medium h-[44px] sm:h-[38px] min-h-[44px] sm:min-h-[38px] px-4 rounded-xl shadow-xs cursor-pointer flex items-center justify-center text-xs"
            >
              Add Staff
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">Total Staff</span>
            <Users className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{metrics.total}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">Active Accounts</span>
            <UserCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{metrics.active}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">Roles</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{roles.length || 2}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">Inactive</span>
            <UserMinus className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{metrics.inactive}</p>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs p-3 sm:p-4 space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, email, department, role…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full h-11 sm:h-10 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0">
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-auto h-11 sm:h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="all">All Roles</option>
              <option value="ACADEMY_ADMIN">Academy Admin</option>
              <option value="ACADEMY_STAFF">Academy Staff</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-auto h-11 sm:h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* ERROR ALERT BANNER */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <Button size="sm" variant="outline" onClick={loadStaffData} className="border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 min-h-[36px] shrink-0">
            Retry
          </Button>
        </div>
      )}

      {/* 4. DESKTOP TABLE (≥ md) */}
      <div className="hidden md:block bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-[#F8FAFC] dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] text-[11px] font-medium text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Staff Member</th>
                <th className="px-4 py-3.5">Access Role</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Course Scope</th>
                <th className="px-4 py-3.5">Last Active</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263244]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    Loading staff members from server...
                  </td>
                </tr>
              ) : paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#64748B] dark:text-[#94A3B8] font-normal">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-[#64748B] dark:text-[#94A3B8]" />
                      <p className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">No Staff Members Found</p>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Try adjusting search keywords or active filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((stf) => (
                  <tr key={stf.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#172033] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.14)] text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[rgba(59,130,246,0.22)] font-semibold text-xs flex items-center justify-center shrink-0 select-none shadow-2xs">
                          {initials(stf.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#0F172A] dark:text-[#F8FAFC] truncate">{stf.name}</p>
                          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate">{stf.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium inline-block ${
                        stf.roleName === 'Academy Admin'
                          ? 'bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200 dark:border-[rgba(59,130,246,0.22)]'
                          : 'bg-indigo-50 dark:bg-[rgba(99,102,241,0.14)] text-indigo-700 dark:text-[#818CF8] border border-indigo-200 dark:border-[rgba(99,102,241,0.22)]'
                      }`}>
                        {stf.roleName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#0F172A] dark:text-[#CBD5E1] font-normal">{stf.department}</td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 text-[#0F172A] dark:text-[#CBD5E1] font-normal">
                        <BookOpen className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8] shrink-0" />
                        {stf.assignedCoursesCount > 0 ? `${stf.assignedCoursesCount} Courses` : 'All Courses'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#64748B] dark:text-[#94A3B8] font-normal whitespace-nowrap">
                      {formatLastActive(stf.lastActiveAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium inline-flex items-center gap-1.5 ${
                        stf.status === 'Active'
                          ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.14)] text-emerald-700 dark:text-[#34D399] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)]'
                          : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#334155]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stf.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {stf.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right relative">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setActionMenuOpenId(actionMenuOpenId === stf.id ? null : stf.id)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {actionMenuOpenId === stf.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setActionMenuOpenId(null)} />
                            <div className="absolute right-0 top-9 z-40 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] rounded-xl shadow-xl py-1 min-w-[170px] text-xs font-medium space-y-0.5">
                              <button
                                type="button"
                                className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-slate-50 dark:hover:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer min-h-[36px]"
                                onClick={() => { setActionMenuOpenId(null); navigate(`/staff/${stf.id}/edit`); }}
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" /> Edit Staff
                              </button>
                              <button
                                type="button"
                                className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-slate-50 dark:hover:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer min-h-[36px]"
                                onClick={() => { handleResendInvite(stf.id); setActionMenuOpenId(null); }}
                              >
                                <Send className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" /> Resend Invite
                              </button>
                              <button
                                type="button"
                                className={`flex items-center gap-2 px-3 py-2 w-full text-left cursor-pointer min-h-[36px] ${
                                  stf.status === 'Active'
                                    ? 'hover:bg-rose-50 dark:hover:bg-[rgba(244,63,94,0.12)] text-rose-600 dark:text-rose-400'
                                    : 'hover:bg-emerald-50 dark:hover:bg-[rgba(16,185,129,0.12)] text-emerald-600 dark:text-emerald-400'
                                }`}
                                onClick={() => {
                                  setActionMenuOpenId(null);
                                  handleToggleActive(stf.id, stf.status);
                                }}
                              >
                                {stf.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                {stf.status === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MOBILE CARDS (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden min-w-0">
        {isLoading ? (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-8 text-center text-[#64748B] dark:text-[#94A3B8]">
            Loading staff members...
          </div>
        ) : paginatedStaff.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-8 text-center text-[#64748B] dark:text-[#94A3B8] font-normal space-y-2">
            <Users className="w-8 h-8 mx-auto text-[#64748B] dark:text-[#94A3B8]" />
            <p className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">No Staff Members Found</p>
            <p className="text-xs">Adjust your search terms or filter selection.</p>
          </div>
        ) : (
          paginatedStaff.map((stf) => (
            <div
              key={stf.id}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs p-4 space-y-3 min-w-0"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.14)] text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[rgba(59,130,246,0.22)] font-semibold text-sm flex items-center justify-center shrink-0 select-none shadow-2xs">
                  {initials(stf.name)}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-tight break-words">{stf.name}</p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal break-all">{stf.email}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0 flex items-center gap-1 ${
                  stf.status === 'Active'
                    ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.14)] text-emerald-700 dark:text-[#34D399] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)]'
                    : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#334155]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stf.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {stf.status}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                  stf.roleName === 'Academy Admin'
                    ? 'bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200 dark:border-[rgba(59,130,246,0.22)]'
                    : 'bg-indigo-50 dark:bg-[rgba(99,102,241,0.14)] text-indigo-700 dark:text-[#818CF8] border border-indigo-200 dark:border-[rgba(99,102,241,0.22)]'
                }`}>
                  {stf.roleName}
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium break-words">{stf.department}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal border-t border-[#E2E8F0] dark:border-[#263244] pt-2.5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                  <span><strong className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{stf.assignedCoursesCount}</strong> Courses</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8] shrink-0" />
                  <span className="truncate">Active: <strong className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{formatLastActive(stf.lastActiveAt)}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
                <button
                  type="button"
                  onClick={() => navigate(`/staff/${stf.id}/edit`)}
                  className="flex-1 h-[44px] min-h-[44px] rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#172033] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleActive(stf.id, stf.status)}
                  className={`flex-1 h-[44px] min-h-[44px] rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                    stf.status === 'Active'
                      ? 'border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-[rgba(244,63,94,0.10)]'
                      : 'border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-[rgba(16,185,129,0.10)]'
                  }`}
                >
                  {stf.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                  {stf.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 6. PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-medium min-w-0">
          <span className="text-[#64748B] dark:text-[#94A3B8] text-center sm:text-left">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, staffList.length)} of {staffList.length} staff members
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#CBD5E1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#172033] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-[44px] h-[44px] rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  currentPage === pg
                    ? 'bg-[#2563EB] text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033]'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#CBD5E1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#172033] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 7. CREATE ACCESS ROLE MODAL */}
      <Modal
        isOpen={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        title="Create Access Role"
        subtitle="Define custom role permissions for your academy team."
      >
        <div className="space-y-4 text-xs font-sans text-left max-h-[75vh] overflow-y-auto pr-1 scrollbar-hide">
          <Input
            label="Role Name"
            placeholder="e.g. Instructor, Finance Staff, Content Manager"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Role Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Can manage assigned courses, student directory and live classrooms."
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="w-full p-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" /> Permission Matrix
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {selectedPermCodes.length} permissions selected
              </span>
            </div>

            <div className="space-y-3">
              {permissionGroups.map((grp) => (
                <div key={grp.module} className="bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl p-3 border border-[#E2E8F0] dark:border-[#334155] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-1.5">
                    <span className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">{grp.module}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const codes = grp.permissions.map((p) => p.code);
                        const allSelected = codes.every((c) => selectedPermCodes.includes(c));
                        if (allSelected) {
                          setSelectedPermCodes((prev) => prev.filter((c) => !codes.includes(c)));
                        } else {
                          setSelectedPermCodes((prev) => Array.from(new Set([...prev, ...codes])));
                        }
                      }}
                      className="text-[10px] font-medium text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer"
                    >
                      Toggle All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {grp.permissions.map((perm) => {
                      const checked = selectedPermCodes.includes(perm.code);
                      return (
                        <label
                          key={perm.code}
                          className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                            checked
                              ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-200'
                              : 'bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#263244] text-[#0F172A] dark:text-[#CBD5E1]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermissionCode(perm.code)}
                            className="mt-0.5 accent-[#2563EB] w-4 h-4 rounded cursor-pointer shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-[11px] leading-tight truncate">{perm.name}</p>
                            <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-normal line-clamp-1">{perm.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
            <Button
              variant="outline"
              onClick={() => setIsCreateRoleOpen(false)}
              className="w-full sm:w-auto font-medium min-h-[42px] rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRole}
              className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium min-h-[42px] rounded-xl cursor-pointer"
            >
              Save Custom Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* 8. ADD STAFF MODAL WITH INLINE ROLE CREATION & REAL COURSE MULTI-SELECT */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Add Staff Member"
        subtitle="Assign an access role and Course scope for a new team member."
      >
        <div className="space-y-4 text-xs font-sans text-left max-h-[75vh] overflow-y-auto pr-1 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
            />
            <Input
              label="Work Email"
              type="email"
              placeholder="rahul@cubixskill.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number (Optional)"
              placeholder="+91 98765 43210"
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
              className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
            />
            <Input
              label="Department / Sub-title"
              placeholder="e.g. Computer Science"
              value={inviteDept}
              onChange={(e) => setInviteDept(e.target.value)}
              className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
            />
          </div>

          {/* ACCESS ROLE SELECTOR WITH INLINE CREATE ROLE BUTTON */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">
                Assign System Access Role
              </label>
              <button
                type="button"
                onClick={() => setIsCreateRoleOpen(true)}
                className="text-[11px] font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> + Create Role
              </button>
            </div>
            <select
              value={inviteRoleCode}
              onChange={(e) => setInviteRoleCode(e.target.value)}
              className="w-full h-11 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6]"
            >
              <optgroup label="System Roles">
                <option value="ACADEMY_ADMIN">Academy Admin (Full Access)</option>
                <option value="ACADEMY_STAFF">Academy Staff (Default Access)</option>
              </optgroup>
              {roles.filter(r => !r.is_system_role).length > 0 && (
                <optgroup label="Custom Academy Roles">
                  {roles.filter(r => !r.is_system_role).map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* COURSE ACCESS SCOPE SELECTOR */}
          <div className="space-y-2 pt-1 border-t border-[#E2E8F0] dark:border-[#263244]">
            <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">
              Course Access Scope
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                courseScope === 'ALL'
                  ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-500 text-blue-700 dark:text-blue-400'
                  : 'bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1]'
              }`}>
                <input
                  type="radio"
                  name="scope"
                  checked={courseScope === 'ALL'}
                  onChange={() => setCourseScope('ALL')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-semibold text-xs">All Courses</p>
                  <p className="text-[10px] opacity-75">Access to all current &amp; future courses</p>
                </div>
              </label>

              <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                courseScope === 'SELECTED'
                  ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-500 text-blue-700 dark:text-blue-400'
                  : 'bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1]'
              }`}>
                <input
                  type="radio"
                  name="scope"
                  checked={courseScope === 'SELECTED'}
                  onChange={() => setCourseScope('SELECTED')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-semibold text-xs">Selected Courses</p>
                  <p className="text-[10px] opacity-75">Restrict strictly to chosen courses</p>
                </div>
              </label>
            </div>

            {/* REAL COURSE MULTI-SELECT DISPLAY */}
            {courseScope === 'SELECTED' && (
              <div className="mt-3 p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search academy courses..."
                    value={courseSearchInput}
                    onChange={(e) => setCourseSearchInput(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#111827] text-[11px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-hide">
                  {filteredCoursesForSelect.length === 0 ? (
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] p-2 text-center">No courses found matching filter.</p>
                  ) : (
                    filteredCoursesForSelect.map((crs) => {
                      const isSelected = selectedCourseIds.includes(crs.id);
                      return (
                        <label
                          key={crs.id}
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer text-[11px] ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200'
                              : 'bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#263244] text-[#0F172A] dark:text-[#CBD5E1]'
                          }`}
                        >
                          <span className="font-medium truncate pr-2">{crs.title}</span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedCourseIds((prev) =>
                                prev.includes(crs.id) ? prev.filter((id) => id !== crs.id) : [...prev, crs.id]
                              );
                            }}
                            className="accent-[#2563EB] w-3.5 h-3.5 rounded cursor-pointer shrink-0"
                          />
                        </label>
                      );
                    })
                  )}
                </div>

                {selectedCourseIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedCourseIds.map((cId) => {
                      const crsObj = availableCourses.find((c) => c.id === cId);
                      return (
                        <span
                          key={cId}
                          className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10px] font-medium flex items-center gap-1"
                        >
                          <span className="max-w-[120px] truncate">{crsObj?.title || cId}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedCourseIds((prev) => prev.filter((id) => id !== cId))}
                            className="hover:text-blue-600 dark:hover:text-blue-200 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PERMISSION PREVIEW MATRIX */}
          <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              <Shield className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              <span>Permission Capabilities Granted</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
              {Object.entries(MODULE_PERMISSIONS_PREVIEW).map(([key, perm]) => {
                const isGranted = inviteRoleCode === 'ACADEMY_ADMIN' ? perm.admin : perm.staff;
                return (
                  <div key={key} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244]">
                    <span className="text-[#0F172A] dark:text-[#CBD5E1] truncate font-medium">{perm.label}</span>
                    {isGranted ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                        <Check className="w-3.5 h-3.5" /> Full
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-normal shrink-0">
                        <Lock className="w-3.5 h-3.5" /> Restricted
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
            <Button
              variant="outline"
              onClick={() => setIsInviteOpen(false)}
              className="w-full sm:w-auto font-medium min-h-[42px] rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]"
            >
              Cancel
            </Button>
            <Button
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={handleInvite}
              className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium min-h-[42px] rounded-xl cursor-pointer"
            >
              Add Staff Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* 9. EDIT STAFF MODAL */}
      {editingStaff && (
        <Modal
          isOpen={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          title="Edit Staff Member"
          subtitle={`Update profile and access permissions for ${editingStaff.name}.`}
        >
          <div className="space-y-4 text-xs font-sans text-left max-h-[75vh] overflow-y-auto pr-1 scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={editingStaff.name}
                onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />
              <Input
                label="Work Email"
                type="email"
                value={editingStaff.email}
                onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={editingStaff.phone || ''}
                onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />
              <Input
                label="Department / Sub-title"
                value={editingStaff.department}
                onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">
                Assign System Role
              </label>
              <select
                value={editingStaff.roleName}
                onChange={(e) => setEditingStaff({ ...editingStaff, roleName: e.target.value })}
                className="w-full h-11 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="Academy Admin">Academy Admin</option>
                <option value="Academy Staff">Academy Staff</option>
              </select>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
              <Button
                variant="outline"
                onClick={() => setEditingStaff(null)}
                className="w-full sm:w-auto font-medium min-h-[42px] rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium min-h-[42px] rounded-xl cursor-pointer"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 10. DEACTIVATE CONFIRMATION MODAL */}
      {deactivateId && (
        <Modal
          isOpen={!!deactivateId}
          onClose={() => setDeactivateId(null)}
          title="Deactivate Staff Account?"
        >
          <div className="space-y-4 text-xs font-sans text-left">
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              This staff member will lose access to the academy management portal. All assigned courses and history will be preserved. You can reactivate their account at any time.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
              <Button
                variant="outline"
                onClick={() => setDeactivateId(null)}
                className="w-full sm:w-auto font-medium min-h-[42px] rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deactivateId && handleToggleActive(deactivateId, 'Active')}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-medium min-h-[42px] rounded-xl cursor-pointer"
              >
                Confirm Deactivation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

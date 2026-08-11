import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import type { StaffMember } from '../../../types/models.types';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

// ─── Seed data ──────────────────────────────────────────────────────────────
const INITIAL_STAFF: StaffMember[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440201',
    name: 'Ananya Roy',
    email: 'ananya.roy@cubixskill.com',
    phone: '+91 98989 12345',
    department: 'Teaching Assistance',
    roleId: '550e8400-e29b-41d4-a716-446655440301',
    roleName: 'Teaching Assistant',
    status: 'Active',
    assignedCoursesCount: 4,
    assignedStudentsCount: 450,
    creditCost: 0,
    lastActiveAt: '2026-08-10T14:23:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440202',
    name: 'Vikas Kumar',
    email: 'vikas.k@cubixskill.com',
    phone: '+91 97777 88888',
    department: 'Finance & Support',
    roleId: '550e8400-e29b-41d4-a716-446655440302',
    roleName: 'Billing Admin',
    status: 'Active',
    assignedCoursesCount: 0,
    assignedStudentsCount: 0,
    creditCost: 0,
    lastActiveAt: '2026-08-09T09:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440203',
    name: 'Priya Nair',
    email: 'priya.nair@cubixskill.com',
    phone: '+91 99911 00001',
    department: 'Curriculum',
    roleId: '550e8400-e29b-41d4-a716-446655440303',
    roleName: 'Course Manager',
    status: 'Inactive',
    assignedCoursesCount: 2,
    assignedStudentsCount: 180,
    creditCost: 0,
    lastActiveAt: '2026-07-28T11:15:00Z',
  },
];

const AVAILABLE_ROLES = ['Teaching Assistant', 'Billing Admin', 'Course Manager'];

// ─── Avatar initials helper ──────────────────────────────────────────────────
function initials(name: string) {
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
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Staff action menu ───────────────────────────────────────────────────────
function StaffActionMenu({
  staffId,
  onDeactivate,
}: {
  staffId: string;
  onDeactivate: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[150px] text-xs font-medium">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2.5 w-full text-left hover:bg-slate-50 text-slate-700 cursor-pointer"
              onClick={() => { setOpen(false); }}
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Edit Details
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2.5 w-full text-left hover:bg-rose-50 text-rose-600 cursor-pointer"
              onClick={() => { setOpen(false); onDeactivate(staffId); }}
            >
              <UserX className="w-3.5 h-3.5" /> Deactivate
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export const StaffDirectoryPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  // Invite form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState(AVAILABLE_ROLES[0]);
  const [inviteDept, setInviteDept] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staffList.filter((s) => {
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.roleName.toLowerCase().includes(q);
      const matchRole = filterRole === 'all' || s.roleName === filterRole;
      const matchStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchQ && matchRole && matchStatus;
    });
  }, [staffList, search, filterRole, filterStatus]);

  function handleInvite() {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      phone: '',
      department: inviteDept.trim() || 'General',
      roleId: `role-${inviteRole.replace(/ /g, '-').toLowerCase()}`,
      roleName: inviteRole,
      status: 'Active',
      assignedCoursesCount: 0,
      assignedStudentsCount: 0,
      creditCost: 0,
    };
    setStaffList((prev) => [newMember, ...prev]);
    setIsInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInviteDept('');
    setInviteRole(AVAILABLE_ROLES[0]);
  }

  function handleDeactivate(id: string) {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Inactive' as const } : s))
    );
    setDeactivateId(null);
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden px-0 space-y-4 pb-24 sm:pb-8 text-left font-sans text-xs text-slate-900 min-w-0">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            Staff Directory
          </h1>
          <p className="text-slate-500 text-xs font-normal mt-0.5">
            Manage team members, assign roles, and track course access.
          </p>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsInviteOpen(true)}
          className="font-medium h-[38px] min-h-[38px] rounded-xl w-full sm:w-auto shrink-0"
        >
          Add Staff
        </Button>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 sm:p-4 space-y-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-normal"
          >
            <option value="all">All Roles</option>
            {AVAILABLE_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-normal"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ── DESKTOP TABLE (≥ md) ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Courses</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-normal">
                    No staff members match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((stf) => (
                <tr key={stf.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-medium text-xs flex items-center justify-center shrink-0 select-none">
                        {initials(stf.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{stf.name}</p>
                        <p className="text-[11px] text-slate-400 font-normal truncate">{stf.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium whitespace-nowrap">
                      {stf.roleName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-normal">{stf.department}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-slate-700 font-normal">
                      <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                      {stf.assignedCoursesCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-normal whitespace-nowrap">
                    {formatLastActive(stf.lastActiveAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={stf.status === 'Active' ? 'success' : 'secondary'} dot>
                      {stf.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StaffActionMenu staffId={stf.id} onDeactivate={(id) => setDeactivateId(id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE CARDS (< md) ── */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 font-normal">
            No staff members match your filters.
          </div>
        )}
        {filtered.map((stf) => (
          <div
            key={stf.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3"
          >
            {/* Row 1: Avatar + Name + Status */}
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-medium text-sm flex items-center justify-center shrink-0 select-none">
                {initials(stf.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 leading-tight truncate">{stf.name}</p>
                <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">{stf.email}</p>
              </div>
              <Badge variant={stf.status === 'Active' ? 'success' : 'secondary'} dot>
                {stf.status}
              </Badge>
            </div>

            {/* Row 2: Role pill + Department */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium">
                {stf.roleName}
              </span>
              <span className="text-[11px] text-slate-500 font-normal">{stf.department}</span>
            </div>

            {/* Row 3: Metadata */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 font-normal border-t border-slate-100 pt-2.5">
              <div className="flex flex-col items-center gap-0.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{stf.assignedCoursesCount}</span>
                <span>Courses</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{stf.assignedStudentsCount}</span>
                <span>Students</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 col-span-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700 text-[10px] text-center leading-tight">
                  {formatLastActive(stf.lastActiveAt)}
                </span>
                <span>Last Active</span>
              </div>
            </div>

            {/* Row 4: Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                className="flex-1 h-9 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Edit
              </button>
              <button
                type="button"
                onClick={() => setDeactivateId(stf.id)}
                className="flex-1 h-9 rounded-xl border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" /> Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── INVITE STAFF MODAL ── */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Add Staff Member"
        subtitle="Send a role-based access invitation to a new team member."
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <Input
            label="Work Email"
            type="email"
            placeholder="rahul@cubixskill.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Input
            label="Department"
            placeholder="e.g. Teaching Assistance"
            value={inviteDept}
            onChange={(e) => setInviteDept(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Assign Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            >
              {AVAILABLE_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsInviteOpen(false)} className="font-medium min-h-[38px] rounded-xl">
              Cancel
            </Button>
            <Button
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={handleInvite}
              className="font-medium min-h-[38px] rounded-xl"
            >
              Send Invitation
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── DEACTIVATE CONFIRM MODAL ── */}
      <Modal
        isOpen={!!deactivateId}
        onClose={() => setDeactivateId(null)}
        title="Deactivate Staff Member"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 font-normal">
            This staff member will lose access to the academy platform. You can reactivate them later.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeactivateId(null)} className="font-medium min-h-[38px] rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => deactivateId && handleDeactivate(deactivateId)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium min-h-[38px] rounded-xl"
            >
              Deactivate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

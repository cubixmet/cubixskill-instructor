import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Check, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { staffService, PermissionGroup } from '../../../services/staff.service';

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

export const RoleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(DEFAULT_PERMISSION_GROUPS);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPermCodes, setSelectedPermCodes] = useState<string[]>([
    'courses.view', 'students.view', 'live_classes.view'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    staffService.getPermissionRegistry().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setPermissionGroups(data);
      }
    }).catch(() => {});
  }, []);

  const togglePermission = (code: string) => {
    setSelectedPermCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      setErrorMsg('Role Name is required.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await staffService.createRole({
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        permission_codes: selectedPermCodes,
      });
      navigate('/roles');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to create role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-left font-sans text-xs bg-[var(--page-background)] text-[var(--text-primary)] min-h-screen">
      {/* BREADCRUMB / BACK */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Link to="/roles" className="hover:text-[var(--brand-primary)] flex items-center gap-1 font-medium text-[var(--text-secondary)]">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Roles &amp; Permissions</span>
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-semibold truncate">Create Custom Role</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Create Custom Access Role</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-normal mt-0.5">
            Configure granular RBAC permissions across all academy modules.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 font-medium">
          {errorMsg}
        </div>
      )}

      {/* FORM CARD */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Role Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Role Name *"
              placeholder="e.g. Teaching Assistant"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)]"
            />
            <Input
              label="Description"
              placeholder="e.g. Can manage student submissions and view courses."
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        {/* PERMISSIONS MATRIX */}
        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Module Capabilities &amp; Permissions</h2>
          <div className="space-y-4">
            {permissionGroups.map((group) => (
              <div key={group.module} className="bg-[var(--surface-secondary)] p-4 rounded-xl border border-[var(--border)] space-y-3">
                <h3 className="font-semibold text-xs text-[var(--text-primary)]">{group.module}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.permissions.map((perm) => {
                    const isChecked = selectedPermCodes.includes(perm.code);
                    return (
                      <label
                        key={perm.id}
                        onClick={() => togglePermission(perm.code)}
                        className={`p-3 rounded-lg border cursor-pointer flex items-start gap-3 transition-colors ${
                          isChecked
                            ? 'bg-[color-mix(in_srgb,var(--brand-primary)_10%,var(--surface))] border-[var(--brand-primary)]'
                            : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.code)}
                          className="mt-0.5 accent-[var(--brand-primary)] w-4 h-4 rounded cursor-pointer shrink-0"
                        />
                        <div>
                          <strong className="text-xs font-semibold text-[var(--text-primary)] block">{perm.name}</strong>
                          <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">{perm.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => navigate('/roles')}
            className="h-11 px-5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] font-semibold text-xs cursor-pointer transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateRole}
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-semibold text-xs cursor-pointer transition-colors w-full sm:w-auto shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Creating Role...' : 'Create Access Role'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

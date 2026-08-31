import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Shield, Check, Lock, Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { staffService, BackendRole, BackendStaffUser } from '../../../services/staff.service';
import { coursesService } from '../../../services/courses.service';

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

export const StaffEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { staffId } = useParams<{ staffId: string }>();

  const [roles, setRoles] = useState<BackendRole[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; title: string }>>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleCode, setRoleCode] = useState('ACADEMY_STAFF');
  const [assignedRoleId, setAssignedRoleId] = useState('');
  const [dept, setDept] = useState('');
  const [courseScope, setCourseScope] = useState<'ALL' | 'SELECTED'>('ALL');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [courseSearchInput, setCourseSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      staffService.getStaffMembers().catch(() => []),
      staffService.getRoles().catch(() => []),
      coursesService.listCourses().catch(() => []),
    ]).then(([staffData, rolesData, coursesData]) => {
      if (rolesData && Array.isArray(rolesData)) {
        setRoles(rolesData.filter((r) => r.code !== 'SUPER_ADMIN' && r.code !== 'SUPER_ADMIN_STAFF'));
      }
      if (coursesData && Array.isArray(coursesData)) {
        setAvailableCourses(coursesData.map((c: any) => ({ id: String(c.id || c.uuid), title: c.title })));
      }

      if (staffData && Array.isArray(staffData) && staffId) {
        const found = staffData.find((s: BackendStaffUser) => s.id === staffId);
        if (found) {
          setName(found.full_name || '');
          setEmail(found.email || '');
          setPhone(found.phone || '');
          setRoleCode(found.role_code || 'ACADEMY_STAFF');
          setAssignedRoleId(found.assigned_role || '');
          setCourseScope(found.course_access_scope || 'ALL');
          setSelectedCourseIds(found.assigned_course_ids || []);
        }
      }
      setIsLoading(false);
    });
  }, [staffId]);

  const filteredCoursesForSelect = availableCourses.filter((c) =>
    c.title.toLowerCase().includes(courseSearchInput.toLowerCase())
  );

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Full Name and Work Email are required.');
      return;
    }
    if (!staffId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await staffService.updateStaffMember(staffId, {
        full_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role_code: roleCode,
        assigned_role: assignedRoleId || undefined,
        course_access_scope: courseScope,
        assigned_course_ids: courseScope === 'SELECTED' ? selectedCourseIds : [],
      });
      navigate('/staff');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to update staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] font-sans">
        Loading staff profile...
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-left font-sans text-xs bg-[var(--page-background)] text-[var(--text-primary)] min-h-screen">
      {/* BREADCRUMB / BACK */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Link to="/staff" className="hover:text-[var(--brand-primary)] flex items-center gap-1 font-medium text-[var(--text-secondary)]">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Staff Directory</span>
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-semibold truncate">Edit Staff</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Edit Staff Member</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-normal mt-0.5">
            Update account details, role permissions, and course access boundaries.
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
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Member Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Vikramaditya Roy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)]"
            />
            <Input
              label="Work Email *"
              type="email"
              placeholder="staff@cubixskill.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)]"
            />
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)]"
            />
            <Input
              label="Department / Designation"
              placeholder="e.g. Computer Science"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        {/* ROLE SELECTION */}
        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Access Role &amp; Level</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              onClick={() => { setRoleCode('ACADEMY_ADMIN'); setAssignedRoleId(''); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                roleCode === 'ACADEMY_ADMIN'
                  ? 'bg-[color-mix(in_srgb,var(--brand-primary)_8%,var(--surface))] border-[var(--brand-primary)]'
                  : 'bg-[var(--surface-secondary)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <input
                type="radio"
                name="roleCode"
                checked={roleCode === 'ACADEMY_ADMIN'}
                onChange={() => { setRoleCode('ACADEMY_ADMIN'); setAssignedRoleId(''); }}
                className="mt-0.5 accent-[var(--brand-primary)]"
              />
              <div>
                <strong className="text-xs font-semibold text-[var(--text-primary)] block">Academy Admin</strong>
                <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">Full administrative access across courses, settings &amp; staff.</span>
              </div>
            </label>

            <label
              onClick={() => setRoleCode('ACADEMY_STAFF')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                roleCode === 'ACADEMY_STAFF'
                  ? 'bg-[color-mix(in_srgb,var(--brand-primary)_8%,var(--surface))] border-[var(--brand-primary)]'
                  : 'bg-[var(--surface-secondary)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <input
                type="radio"
                name="roleCode"
                checked={roleCode === 'ACADEMY_STAFF'}
                onChange={() => setRoleCode('ACADEMY_STAFF')}
                className="mt-0.5 accent-[var(--brand-primary)]"
              />
              <div>
                <strong className="text-xs font-semibold text-[var(--text-primary)] block">Academy Staff</strong>
                <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">Standard staff privileges tailored for teaching &amp; assistance.</span>
              </div>
            </label>
          </div>

          {roles.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">Custom RBAC Role Preset</label>
              <select
                value={assignedRoleId}
                onChange={(e) => setAssignedRoleId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[var(--input-border)] bg-[var(--surface-secondary)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
              >
                <option value="">Default {roleCode === 'ACADEMY_ADMIN' ? 'Admin' : 'Staff'} Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* COURSE ACCESS SCOPE */}
        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Course Access Scope</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              onClick={() => setCourseScope('ALL')}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 ${
                courseScope === 'ALL'
                  ? 'bg-[color-mix(in_srgb,var(--brand-primary)_8%,var(--surface))] border-[var(--brand-primary)]'
                  : 'bg-[var(--surface-secondary)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <input
                type="radio"
                name="courseScope"
                checked={courseScope === 'ALL'}
                onChange={() => setCourseScope('ALL')}
                className="accent-[var(--brand-primary)]"
              />
              <div>
                <p className="font-semibold text-xs text-[var(--text-primary)]">All Courses</p>
                <p className="text-[11px] text-[var(--text-muted)]">Full visibility on current &amp; future courses</p>
              </div>
            </label>

            <label
              onClick={() => setCourseScope('SELECTED')}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 ${
                courseScope === 'SELECTED'
                  ? 'bg-[color-mix(in_srgb,var(--brand-primary)_8%,var(--surface))] border-[var(--brand-primary)]'
                  : 'bg-[var(--surface-secondary)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <input
                type="radio"
                name="courseScope"
                checked={courseScope === 'SELECTED'}
                onChange={() => setCourseScope('SELECTED')}
                className="accent-[var(--brand-primary)]"
              />
              <div>
                <p className="font-semibold text-xs text-[var(--text-primary)]">Selected Courses Only</p>
                <p className="text-[11px] text-[var(--text-muted)]">Restrict strictly to chosen courses</p>
              </div>
            </label>
          </div>

          {courseScope === 'SELECTED' && (
            <div className="mt-3 p-4 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search academy courses..."
                  value={courseSearchInput}
                  onChange={(e) => setCourseSearchInput(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--input-border)] bg-[var(--surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 no-scrollbar">
                {filteredCoursesForSelect.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] py-3 text-center">No courses found matching search filter.</p>
                ) : (
                  filteredCoursesForSelect.map((crs) => {
                    const isSelected = selectedCourseIds.includes(crs.id);
                    return (
                      <label
                        key={crs.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-[color-mix(in_srgb,var(--brand-primary)_10%,var(--surface))] border-[var(--brand-primary)] text-[var(--text-primary)]'
                            : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]'
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
                          className="accent-[var(--brand-primary)] w-4 h-4 rounded cursor-pointer shrink-0"
                        />
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* PERMISSION PREVIEW */}
        <div className="space-y-2 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
            <Shield className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Permission Capabilities Granted</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[var(--surface-secondary)] p-3 rounded-xl border border-[var(--border)]">
            {Object.entries(MODULE_PERMISSIONS_PREVIEW).map(([key, perm]) => {
              const isGranted = roleCode === 'ACADEMY_ADMIN' ? perm.admin : perm.staff;
              return (
                <div key={key} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[var(--text-primary)] truncate font-medium">{perm.label}</span>
                  {isGranted ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                      <Check className="w-3.5 h-3.5" /> Full
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[var(--text-muted)] font-normal shrink-0">
                      <Lock className="w-3.5 h-3.5" /> Restricted
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => navigate('/staff')}
            className="h-11 px-5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] font-semibold text-xs cursor-pointer transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-semibold text-xs cursor-pointer transition-colors w-full sm:w-auto shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

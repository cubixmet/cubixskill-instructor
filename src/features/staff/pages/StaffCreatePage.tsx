import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Shield, Check, Lock, X, Search } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { staffService, BackendRole } from '../../../services/staff.service';
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

export const StaffCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<BackendRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [roleSearchInput, setRoleSearchInput] = useState<string>('');
  const [rolesLoading, setRolesLoading] = useState<boolean>(true);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; title: string }>>([]);

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRoleCode, setInviteRoleCode] = useState('ACADEMY_STAFF');
  const [courseScope, setCourseScope] = useState<'ALL' | 'SELECTED'>('ALL');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [courseSearchInput, setCourseSearchInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [coursesLoading, setCoursesLoading] = useState<boolean>(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const fetchCoursesAndRoles = async () => {
    setCoursesLoading(true);
    setRolesLoading(true);
    setCoursesError(null);
    setRolesError(null);
    try {
      const [rolesData, coursesData] = await Promise.all([
        staffService.getRoles().catch((err) => {
          setRolesError(err?.response?.data?.message || err?.message || 'Unable to load academy roles.');
          return [];
        }),
        coursesService.listCourses({ page_size: 200 }).catch((err) => {
          throw err;
        }),
      ]);

      if (rolesData && Array.isArray(rolesData)) {
        const assignable = rolesData.filter((r) => r.code !== 'SUPER_ADMIN' && r.code !== 'SUPER_ADMIN_STAFF');
        setRoles(assignable);
        if (assignable.length > 0 && !selectedRoleId) {
          setSelectedRoleId(assignable[0].id);
          setInviteRoleCode(assignable[0].code === 'ACADEMY_ADMIN' ? 'ACADEMY_ADMIN' : 'ACADEMY_STAFF');
        }
      }

      let courseList: any[] = [];
      if (Array.isArray(coursesData)) {
        courseList = coursesData;
      } else if (coursesData && Array.isArray((coursesData as any).results)) {
        courseList = (coursesData as any).results;
      }

      setAvailableCourses(
        courseList.map((c: any) => ({
          id: String(c.id || c.uuid),
          title: c.title || 'Untitled Course',
        }))
      );
    } catch (err: any) {
      setCoursesError(err?.response?.data?.message || err?.message || 'Unable to load academy courses.');
    } finally {
      setCoursesLoading(false);
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndRoles();
  }, []);

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(roleSearchInput.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(roleSearchInput.toLowerCase()))
  );

  const filteredCoursesForSelect = availableCourses.filter((c) =>
    c.title.toLowerCase().includes(courseSearchInput.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setErrorMsg('Full Name and Work Email are required.');
      return;
    }

    if (!selectedRoleId && roles.length > 0) {
      setErrorMsg('Please select an access role for the new staff member.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const targetRole = roles.find((r) => r.id === selectedRoleId);
    const roleCode = targetRole?.code === 'ACADEMY_ADMIN' ? 'ACADEMY_ADMIN' : 'ACADEMY_STAFF';

    try {
      await staffService.inviteStaff({
        full_name: inviteName.trim(),
        email: inviteEmail.trim(),
        phone: invitePhone.trim(),
        role_code: roleCode,
        assigned_role: selectedRoleId || undefined,
        course_access_scope: courseScope,
        assigned_course_ids: courseScope === 'SELECTED' ? selectedCourseIds : [],
      });
      navigate('/staff');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to add staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-[900px] mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left font-sans text-xs bg-[var(--page-background)] text-[var(--text-primary)] min-h-screen pb-28 sm:pb-12">
      {/* BREADCRUMB / BACK */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Link to="/staff" className="hover:text-[var(--brand-primary)] flex items-center gap-1 font-medium text-[var(--text-secondary)] min-h-[36px] items-center">
          <ArrowLeft className="w-4 h-4" />
          <span>Staff Directory</span>
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-semibold truncate">Add New Staff</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Add Staff Member</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-normal mt-0.5">
            Register a new team member and assign access roles &amp; course boundaries.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 font-medium">
          {errorMsg}
        </div>
      )}

      {/* FORM CARD */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-6">
        <div className="space-y-4">
          <h2 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Member Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Vikramaditya Roy"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] text-base sm:text-sm min-h-[44px]"
            />
            <Input
              label="Work Email *"
              type="email"
              placeholder="staff@cubixskill.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] text-base sm:text-sm min-h-[44px]"
            />
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
              className="bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] text-base sm:text-sm min-h-[44px]"
            />
            <Input
              label="Department / Designation"
              placeholder="e.g. Computer Science"
              value={inviteDept}
              onChange={(e) => setInviteDept(e.target.value)}
              className="bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] text-base sm:text-sm min-h-[44px]"
            />
          </div>
        </div>

        {/* ROLE SELECTION */}
        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Role &amp; Permissions</h2>
            <Link to="/roles/create" className="text-xs text-[var(--brand-primary)] hover:underline font-medium flex items-center gap-1">
              <span>+ Create New Role</span>
            </Link>
          </div>

          {rolesLoading ? (
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-center text-xs text-[var(--text-muted)] animate-pulse">
              Loading available academy roles...
            </div>
          ) : rolesError ? (
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
              <span>{rolesError}</span>
              <button
                type="button"
                onClick={fetchCoursesAndRoles}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : roles.length === 0 ? (
            <div className="p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-center space-y-2">
              <p className="text-xs text-[var(--text-secondary)] font-medium">Create a role before adding staff</p>
              <p className="text-[11px] text-[var(--text-muted)]">No active RBAC roles found for this academy.</p>
              <Link
                to="/roles/create"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Create Role</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search role by name or description..."
                  value={roleSearchInput}
                  onChange={(e) => setRoleSearchInput(e.target.value)}
                  className="w-full h-11 sm:h-10 pl-9 pr-3 rounded-xl border border-[var(--input-border)] bg-[var(--surface-secondary)] text-base sm:text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] min-h-[44px]"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredRoles.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] p-2">No roles match your search.</p>
                ) : (
                  filteredRoles.map((r) => {
                    const isSelected = selectedRoleId === r.id;
                    return (
                      <label
                        key={r.id}
                        onClick={() => {
                          setSelectedRoleId(r.id);
                          if (r.code === 'ACADEMY_ADMIN') {
                            setInviteRoleCode('ACADEMY_ADMIN');
                          } else {
                            setInviteRoleCode('ACADEMY_STAFF');
                          }
                        }}
                        className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 min-h-[44px] ${
                          isSelected
                            ? 'bg-[color-mix(in_srgb,var(--brand-primary)_8%,var(--surface))] border-[var(--brand-primary)] shadow-2xs'
                            : 'bg-[var(--surface-secondary)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedRoleId"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedRoleId(r.id);
                            if (r.code === 'ACADEMY_ADMIN') {
                              setInviteRoleCode('ACADEMY_ADMIN');
                            } else {
                              setInviteRoleCode('ACADEMY_STAFF');
                            }
                          }}
                          className="mt-0.5 accent-[var(--brand-primary)] w-4 h-4 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <strong className="text-xs font-semibold text-[var(--text-primary)] block">{r.name}</strong>
                            {r.scope && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--text-muted)]">
                                {r.scope}
                              </span>
                            )}
                          </div>
                          {r.description && (
                            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5 leading-snug">
                              {r.description}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* COURSE ACCESS SCOPE */}
        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
          <h2 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Course Access Scope</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              onClick={() => setCourseScope('ALL')}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 min-h-[44px] ${
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
                className="accent-[var(--brand-primary)] w-4 h-4 shrink-0"
              />
              <div>
                <p className="font-semibold text-xs text-[var(--text-primary)]">All Courses</p>
                <p className="text-[11px] text-[var(--text-muted)]">Full visibility on current &amp; future courses</p>
              </div>
            </label>

            <label
              onClick={() => setCourseScope('SELECTED')}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 min-h-[44px] ${
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
                className="accent-[var(--brand-primary)] w-4 h-4 shrink-0"
              />
              <div>
                <p className="font-semibold text-xs text-[var(--text-primary)]">Selected Courses Only</p>
                <p className="text-[11px] text-[var(--text-muted)]">Restrict strictly to chosen courses</p>
              </div>
            </label>
          </div>

          {courseScope === 'SELECTED' && (
            <div className="mt-3 p-3.5 sm:p-4 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search academy courses..."
                  value={courseSearchInput}
                  onChange={(e) => setCourseSearchInput(e.target.value)}
                  className="w-full h-11 sm:h-9 pl-9 pr-3 rounded-lg border border-[var(--input-border)] bg-[var(--surface)] text-base sm:text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 no-scrollbar">
                {coursesLoading ? (
                  <div className="py-4 text-center text-[var(--text-muted)] space-y-1">
                    <p className="text-xs font-medium">Loading academy courses...</p>
                  </div>
                ) : coursesError ? (
                  <div className="py-3 px-4 text-center space-y-2">
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{coursesError}</p>
                    <button
                      type="button"
                      onClick={fetchCoursesAndRoles}
                      className="px-3 py-1 rounded-md text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)]"
                    >
                      Retry Loading
                    </button>
                  </div>
                ) : availableCourses.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] py-3 text-center">No courses available for assignment.</p>
                ) : filteredCoursesForSelect.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] py-3 text-center">No courses match your search.</p>
                ) : (
                  filteredCoursesForSelect.map((crs) => {
                    const isSelected = selectedCourseIds.includes(crs.id);
                    return (
                      <label
                        key={crs.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer text-xs min-h-[44px] ${
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
              const isGranted = inviteRoleCode === 'ACADEMY_ADMIN' ? perm.admin : perm.staff;
              return (
                <div key={key} className="flex items-center justify-between text-[11px] p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[var(--text-primary)] truncate font-medium pr-2">{perm.label}</span>
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
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => navigate('/staff')}
            className="h-11 px-5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] font-semibold text-xs cursor-pointer transition-colors w-full sm:w-auto min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInvite}
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-semibold text-xs cursor-pointer transition-colors w-full sm:w-auto shadow-xs disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'Adding Staff...' : 'Add Staff Member'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Plus, Search, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { staffService, BackendRole } from '../../../services/staff.service';

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<BackendRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Pagination
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 8;

  // Modal State for Delete
  const [deleteRole, setDeleteRole] = useState<BackendRole | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staffService.getRoles();
      // Exclude platform Super Admin roles for Academy scope
      const academyRoles = data.filter((r) => r.code !== 'SUPER_ADMIN' && r.code !== 'SUPER_ADMIN_STAFF');
      setRoles(academyRoles);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load access roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filteredRoles = roles.filter((role) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      role.name.toLowerCase().includes(q) ||
      role.code.toLowerCase().includes(q) ||
      (role.description && role.description.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const paginatedRoles = filteredRoles.slice((page - 1) * pageSize, page * pageSize);

  const confirmDeleteRole = async () => {
    if (!deleteRole) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await staffService.deleteRole(deleteRole.id);
      setDeleteRole(null);
      fetchRoles();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || err?.message || 'Failed to delete role.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip space-y-4 pb-24 md:pb-8 text-left font-sans text-xs text-[var(--text-primary)] bg-[var(--page-background)] min-h-screen font-normal">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0 border-b border-[var(--border)] pb-4">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight truncate">
            Roles &amp; Access Permissions
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-normal mt-0.5 truncate">
            Manage granular RBAC permission definitions across academy modules.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchRoles}
            className="h-[44px] sm:h-[38px] border-[var(--border)] text-[var(--text-secondary)] font-medium px-3 rounded-xl flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>Refresh</span>
          </Button>
          <Link to="/roles/create">
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-semibold h-[44px] sm:h-[38px] min-h-[44px] sm:min-h-[38px] px-4 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              Create Role
            </Button>
          </Link>
        </div>
      </div>

      {/* ── TOOLBAR: SEARCH & FILTERS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search roles by name or code..."
            value={searchInput}
            onChange={handleSearchChange}
            leftIcon={<Search className="w-4 h-4 text-[var(--text-muted)]" />}
            className="font-normal bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] min-h-[44px] sm:min-h-[36px]"
          />
        </div>
        <div className="text-xs text-[var(--text-muted)] font-medium">
          Showing <strong>{filteredRoles.length}</strong> role(s)
        </div>
      </div>

      {/* ── ROLES CONTENT ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-center bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-900 dark:text-rose-300 font-medium">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchRoles}>Retry</Button>
        </div>
      ) : filteredRoles.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No roles found"
          description={debouncedSearch ? 'No access roles match your search query.' : 'Create your first custom access role.'}
          actionLabel="Create Role"
          onAction={() => window.location.href = '/roles/create'}
        />
      ) : (
        <div className="space-y-3 min-w-0">
          {paginatedRoles.map((role) => {
            const isSystem = role.is_system_role || ['ACADEMY_ADMIN', 'ACADEMY_STAFF', 'ADMIN', 'STAFF'].includes(role.code);
            const permCount = role.permissions ? role.permissions.length : 0;

            return (
              <div
                key={role.id}
                className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xs p-4 sm:p-5 space-y-3 min-w-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 border-b border-[var(--border)] pb-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 truncate">
                        <Shield className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                        <span>{role.name}</span>
                      </h2>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-secondary)]">
                        {role.code}
                      </span>
                      {isSystem && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> System Standard
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      {role.description || 'Custom role permissions definition.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {!isSystem && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteRole(role)}
                        className="font-medium text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 min-h-[44px] sm:min-h-[36px] h-9 px-3 rounded-xl text-xs cursor-pointer"
                      >
                        Delete Role
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[var(--text-secondary)] font-medium">
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                    Granted Capabilities: <strong>{permCount} permission(s)</strong>
                  </span>
                  {role.permissions && role.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-w-full">
                      {role.permissions.slice(0, 6).map((p, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[color-mix(in_srgb,var(--brand-primary)_8%,var(--surface))] text-[var(--text-primary)] border border-[var(--border)] text-[10px]">
                          {p.code || p.name || (p.permission ? p.permission.name : 'Permission')}
                        </span>
                      ))}
                      {role.permissions.length > 6 && (
                        <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-muted)] text-[10px]">
                          +{role.permissions.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* ── PAGINATION CONTROLS ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
              <span>Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 min-h-[44px] sm:min-h-[36px] px-3 border-[var(--border)]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 min-h-[44px] sm:min-h-[36px] px-3 border-[var(--border)]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DELETE ROLE CONFIRMATION MODAL ── */}
      {deleteRole && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteRole(null)}
          title="Delete Custom Role"
          subtitle={`Are you sure you want to delete "${deleteRole.name}"?`}
        >
          <div className="space-y-4 font-sans text-xs text-[var(--text-primary)] text-left">
            <p className="text-[var(--text-secondary)]">
              This action cannot be undone. Staff members currently assigned to this custom role will revert to standard Academy Staff privileges.
            </p>
            {deleteError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{deleteError}</p>
            )}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
              <Button
                variant="outline"
                onClick={() => setDeleteRole(null)}
                className="min-h-[44px] sm:min-h-[36px] w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                disabled={isDeleting}
                onClick={confirmDeleteRole}
                className="bg-rose-600 hover:bg-rose-700 text-white min-h-[44px] sm:min-h-[36px] w-full sm:w-auto font-semibold"
              >
                {isDeleting ? 'Deleting Role...' : 'Confirm Delete Role'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

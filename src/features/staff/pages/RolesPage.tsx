import React, { useState } from 'react';
import { Shield, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { Role } from '../../../types/models.types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

const INITIAL_ROLES: Role[] = [
  {
    id: 'role-academy-admin',
    name: 'Academy Admin',
    description: 'Full administrative access to manage academy settings, courses, students, and staff.',
    creditCost: 0,
    permissions: {
      Courses: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
      Students: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
      Curriculum: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
      Media: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
      Certificates: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
      Discussions: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
      LiveClasses: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
      Coupons: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
      WebsiteBuilder: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
      Staff: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
      Settings: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
    },
  },
  {
    id: 'role-academy-staff',
    name: 'Academy Staff',
    description: 'Staff access to manage assigned courses, review submissions, and assist students.',
    creditCost: 0,
    permissions: {
      Courses: { view: true, create: false, edit: true, delete: false, publish: false, export: true, approve: false },
      Students: { view: true, create: false, edit: false, delete: false, publish: false, export: true, approve: false },
      Curriculum: { view: true, create: true, edit: true, delete: false, publish: true, export: false, approve: false },
      Media: { view: true, create: true, edit: true, delete: false, publish: false, export: false, approve: false },
      Certificates: { view: true, create: false, edit: false, delete: false, publish: false, export: true, approve: false },
      Discussions: { view: true, create: true, edit: true, delete: true, publish: true, export: false, approve: true },
      LiveClasses: { view: true, create: true, edit: true, delete: false, publish: true, export: false, approve: false },
      Coupons: { view: false, create: false, edit: false, delete: false, publish: false, export: false, approve: false },
      WebsiteBuilder: { view: false, create: false, edit: false, delete: false, publish: false, export: false, approve: false },
      Staff: { view: false, create: false, edit: false, delete: false, publish: false, export: false, approve: false },
      Settings: { view: false, create: false, edit: false, delete: false, publish: false, export: false, approve: false },
    },
  },
];


const PERMISSION_GROUPS = [
  'Courses',
  'Students',
  'Curriculum',
  'Media',
  'Certificates',
  'Discussions',
  'LiveClasses',
  'Coupons',
  'WebsiteBuilder',
  'Staff',
  'Settings',
] as const;

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  const toggleAccordion = (roleId: string, groupName: string) => {
    const key = `${roleId}-${groupName}`;
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) return;

    const defaultPerms: Role['permissions'] = {};
    PERMISSION_GROUPS.forEach((group) => {
      defaultPerms[group] = {
        view: true,
        create: false,
        edit: false,
        delete: false,
        publish: false,
        export: false,
        approve: false,
      };
    });

    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      description: newRoleDescription.trim() || 'Custom role permissions definition.',
      creditCost: 0,
      permissions: defaultPerms,
    };

    setRoles((prev) => [...prev, newRole]);
    setIsCreateModalOpen(false);
    setNewRoleName('');
    setNewRoleDescription('');
  };

  const handleDeleteRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    setDeleteRoleId(null);
  };

  const togglePermission = (roleId: string, group: string, action: 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'export' | 'approve') => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;
        const currentGroup = role.permissions[group] || {
          view: false,
          create: false,
          edit: false,
          delete: false,
          publish: false,
          export: false,
          approve: false,
        };

        return {
          ...role,
          permissions: {
            ...role.permissions,
            [group]: {
              ...currentGroup,
              [action]: !currentGroup[action],
            },
          },
        };
      })
    );
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden px-0 space-y-4 pb-24 sm:pb-8 text-left font-sans text-xs text-slate-900 min-w-0">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-0.5 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-medium text-slate-900 tracking-tight leading-tight">
            Roles &amp; Access Permissions
          </h1>
          <p className="text-slate-500 text-xs font-normal mt-0.5">
            Configure permission matrices and module access rights for team roles.
          </p>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsCreateModalOpen(true)}
          className="font-medium h-[38px] min-h-[38px] rounded-xl w-full sm:w-auto shrink-0"
        >
          Create Role
        </Button>
      </div>

      {/* ── ROLES LIST ── */}
      <div className="space-y-4 min-w-0">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4 min-w-0"
          >
            {/* Header: Role Name + Desc + Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 min-w-0">
              <div className="min-w-0">
                <h2 className="text-sm font-medium text-slate-900 flex items-center gap-2 truncate">
                  <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{role.name}</span>
                </h2>
                <p className="text-slate-500 text-xs font-normal mt-0.5 leading-relaxed">
                  {role.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteRoleId(role.id)}
                  className="font-medium text-rose-600 border-rose-200 hover:bg-rose-50 h-8 rounded-xl text-xs"
                >
                  Delete Role
                </Button>
              </div>
            </div>

            {/* ── DESKTOP PERMISSION MATRIX (≥ md) ── */}
            <div className="hidden md:block overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="bg-slate-50 text-[10px] font-medium text-slate-500 uppercase tracking-wider rounded-xl">
                  <tr>
                    <th className="p-3 rounded-l-xl">Module Group</th>
                    <th className="p-3 text-center">View</th>
                    <th className="p-3 text-center">Create</th>
                    <th className="p-3 text-center">Edit</th>
                    <th className="p-3 text-center">Delete</th>
                    <th className="p-3 text-center">Approve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {PERMISSION_GROUPS.map((groupName) => {
                    const perm = role.permissions[groupName] || {
                      view: false,
                      create: false,
                      edit: false,
                      delete: false,
                      publish: false,
                      export: false,
                      approve: false,
                    };
                    return (
                      <tr key={groupName} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-medium text-slate-900">{groupName}</td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.view}
                            onChange={() => togglePermission(role.id, groupName, 'view')}
                            className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.create}
                            onChange={() => togglePermission(role.id, groupName, 'create')}
                            className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.edit}
                            onChange={() => togglePermission(role.id, groupName, 'edit')}
                            className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.delete}
                            onChange={() => togglePermission(role.id, groupName, 'delete')}
                            className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.approve}
                            onChange={() => togglePermission(role.id, groupName, 'approve')}
                            className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE ACCORDIONS FOR PERMISSION GROUPS (< md) ── */}
            <div className="md:hidden space-y-2 min-w-0">
              {PERMISSION_GROUPS.map((groupName) => {
                const isAccordionOpen = !!openAccordions[`${role.id}-${groupName}`];
                const perm = role.permissions[groupName] || {
                  view: false,
                  create: false,
                  edit: false,
                  delete: false,
                  publish: false,
                  export: false,
                  approve: false,
                };

                return (
                  <div
                    key={groupName}
                    className="border border-slate-200 rounded-xl overflow-hidden min-w-0 bg-slate-50/50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(role.id, groupName)}
                      className="w-full p-3 flex items-center justify-between text-xs font-medium text-slate-900 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{groupName}</span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-[10px] text-slate-500 font-normal">
                          {Object.values(perm).filter(Boolean).length} enabled
                        </span>
                        {isAccordionOpen ? (
                          <ChevronUp className="w-4 h-4 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 shrink-0" />
                        )}
                      </div>
                    </button>

                    {isAccordionOpen && (
                      <div className="p-3 bg-white border-t border-slate-100 space-y-2 text-xs font-normal">
                        {(['view', 'create', 'edit', 'delete', 'approve'] as const).map((action) => (
                          <label
                            key={action}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors"
                          >
                            <span className="capitalize text-slate-700 font-medium">{action}</span>
                            <input
                              type="checkbox"
                              checked={perm[action]}
                              onChange={() => togglePermission(role.id, groupName, action)}
                              className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── CREATE ROLE MODAL ── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Role"
        subtitle="Define a custom role name and default permission rights."
      >
        <div className="space-y-4 font-sans text-xs text-slate-900 text-left">
          <Input
            label="Role Name"
            placeholder="e.g. Content Reviewer"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Describe access responsibilities..."
              value={newRoleDescription}
              onChange={(e) => setNewRoleDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-normal focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              className="font-medium h-9 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateRole}
              className="font-medium h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── DELETE ROLE CONFIRM MODAL ── */}
      <Modal
        isOpen={!!deleteRoleId}
        onClose={() => setDeleteRoleId(null)}
        title="Delete Role Definition"
      >
        <div className="space-y-4 font-sans text-xs text-slate-900 text-left">
          <p className="text-slate-600 font-normal leading-relaxed text-xs">
            Are you sure you want to delete this role definition? Staff assigned to this role will need to be re-assigned.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteRoleId(null)}
              className="font-medium h-9 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => deleteRoleId && handleDeleteRole(deleteRoleId)}
              className="font-medium h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

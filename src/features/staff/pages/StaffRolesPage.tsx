import React, { useState } from 'react';
import { Shield, Plus, Check, X, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Role, StaffMember } from '../../../types/models.types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

export const StaffRolesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'staff' | 'roles'>('staff');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const staffList: StaffMember[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440201',
      name: 'Ananya Roy',
      email: 'ananya.roy@cubixskill.com',
      phone: '+91 98989 12345',
      department: 'Teaching Assistance',
      roleId: '550e8400-e29b-41d4-a716-446655440301',
      roleName: 'Teaching Assistant',
      status: 'Active',
      assignedCoursesCount: 2,
      assignedStudentsCount: 450,
      creditCost: 0,
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
    },
  ];

  const roles: Role[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440301',
      name: 'Teaching Assistant',
      description: 'Can manage assignments, review submissions, and view student progress.',
      creditCost: 0,
      permissions: {
        Courses: { view: true, create: false, edit: true, delete: false, publish: false, export: true, approve: false },
        Assignments: { view: true, create: true, edit: true, delete: false, publish: true, export: true, approve: true },
        Students: { view: true, create: false, edit: false, delete: false, publish: false, export: true, approve: false },
      },
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440302',
      name: 'Billing Admin',
      description: 'Access to credits wallet, payments, orders, and invoices.',
      creditCost: 0,
      permissions: {
        Credits: { view: true, create: true, edit: true, delete: false, publish: true, export: true, approve: true },
        Payments: { view: true, create: false, edit: false, delete: false, publish: false, export: true, approve: false },
      },
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff & Permissions</h1>
          <p className="text-xs text-slate-500 mt-1">Manage academy team members, assign courses, and configure permission matrices.</p>
        </div>
        <div>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsInviteModalOpen(true)}
          >
            {activeTab === 'staff' ? 'Invite Staff Member' : 'Create Custom Role'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 gap-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'staff' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Staff Members ({staffList.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'roles' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Role Permission Matrix ({roles.length})
        </button>
      </div>

      {/* AnimatePresence Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'staff' && (
            <Card padding="none" className="overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-4">Staff Member</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Assigned Courses</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffList.map((stf) => (
                      <tr key={stf.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                              {stf.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{stf.name}</span>
                              <span className="text-[11px] text-slate-400">{stf.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-700">{stf.department}</td>
                        <td className="p-4 font-bold text-blue-600">{stf.roleName}</td>
                        <td className="p-4 text-slate-900 font-semibold">{stf.assignedCoursesCount} Courses</td>
                        <td className="p-4">
                          <Badge variant="success" dot>
                            {stf.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                            Edit Permissions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="sm:hidden p-4 space-y-3">
                {staffList.map((stf) => (
                  <div key={stf.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{stf.name}</h4>
                      <Badge variant="success" dot>{stf.status}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">{stf.email}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="font-semibold text-blue-600">{stf.roleName}</span>
                      <button className="text-blue-600 font-bold">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6">
              {roles.map((role) => (
                <Card key={role.id} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" /> {role.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure Matrix
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                        <tr>
                          <th className="p-3">Module</th>
                          <th className="p-3 text-center">View</th>
                          <th className="p-3 text-center">Create</th>
                          <th className="p-3 text-center">Edit</th>
                          <th className="p-3 text-center">Delete</th>
                          <th className="p-3 text-center">Approve</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(role.permissions).map(([moduleName, perm]) => (
                          <tr key={moduleName}>
                            <td className="p-3 font-bold text-slate-900">{moduleName}</td>
                            <td className="p-3 text-center">{perm.view ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-rose-500 mx-auto" />}</td>
                            <td className="p-3 text-center">{perm.create ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-rose-500 mx-auto" />}</td>
                            <td className="p-3 text-center">{perm.edit ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-rose-500 mx-auto" />}</td>
                            <td className="p-3 text-center">{perm.delete ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-rose-500 mx-auto" />}</td>
                            <td className="p-3 text-center">{perm.approve ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-rose-500 mx-auto" />}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Invite Staff Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Staff Member"
        subtitle="Grant role-based access permissions to an instructor or assistant."
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="e.g. Rahul Sharma" />
          <Input label="Work Email" type="email" placeholder="rahul@cubixskill.com" />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Assign Role</label>
            <select className="w-full h-11 px-4 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
              <option>Teaching Assistant</option>
              <option>Billing Admin</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setIsInviteModalOpen(false)}>
              Send Invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

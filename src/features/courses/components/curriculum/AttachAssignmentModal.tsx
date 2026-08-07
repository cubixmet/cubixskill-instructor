import React, { useState } from 'react';
import { Search, FileCheck, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { useAssignmentStore } from '../../../assignments/store/assignment.store';
import type { Assignment } from '../../../../types/assignment.types';

interface AttachAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseUuid: string;
  onSelectAssignment: (assignment: Assignment) => void;
  currentlyAttachedUuid?: string;
  autoSelectUuid?: string;
}

export const AttachAssignmentModal: React.FC<AttachAssignmentModalProps> = ({
  isOpen,
  onClose,
  courseUuid,
  onSelectAssignment,
  currentlyAttachedUuid,
  autoSelectUuid,
}) => {
  const navigate = useNavigate();
  const assignments = useAssignmentStore((state) => state.assignments);

  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'All' | 'Published' | 'Draft'>('All');
  const [selectedUuid, setSelectedUuid] = useState<string | undefined>(
    autoSelectUuid || currentlyAttachedUuid || undefined
  );

  // Early Return AFTER all hooks have been declared
  if (!isOpen) return null;

  const courseAssignments = assignments.filter((a) => a.courseUuid === courseUuid || !a.courseUuid);

  const filteredAssignments = courseAssignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterTab === 'All'
        ? true
        : filterTab === 'Published'
        ? a.status === 'Published'
        : a.status === 'Draft';
    return matchesSearch && matchesFilter;
  });

  const activeSelectedUuid = selectedUuid || autoSelectUuid || currentlyAttachedUuid || courseAssignments[0]?.id;
  const selectedAssignment = assignments.find((a) => a.id === activeSelectedUuid);

  const handleCreateNew = () => {
    onClose();
    navigate(`/courses/${courseUuid}/assignments`, {
      state: {
        openCreateAssignment: true,
        returnTo: `/courses/${courseUuid}/curriculum`,
      },
    });
  };

  const handleConfirmAttach = () => {
    if (selectedAssignment) {
      onSelectAssignment(selectedAssignment);
      onClose();
    }
  };

  // EMPTY STATE WHEN NO ASSIGNMENTS EXIST
  if (courseAssignments.length === 0) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="No assignments created yet."
        subtitle="Create an assignment first, then return here to attach it to this lesson."
        maxWidth="md"
      >
        <div className="space-y-6 font-sans text-xs text-left p-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto border border-blue-100">
            <FileCheck className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[#0F172A]">No Assignments Repository Found</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Assignments must be created and managed from the dedicated Assignments module before attaching them to lessons.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button type="button" variant="outline" onClick={onClose} className="h-10 text-xs font-semibold px-5">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateNew}
              className="h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs px-6"
            >
              Create Assignment
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attach Assignment"
      subtitle="Select an existing assignment to attach to this lesson."
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-xs text-left">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments by name..."
            className="w-full h-10 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* Filter Chips & Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-xs">
            {(['All', 'Published', 'Draft'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                  filterTab === tab
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                }`}
              >
                {tab === 'All' ? 'All' : tab === 'Published' ? 'Published' : 'Draft'}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5 text-[#2563EB]" />}
            onClick={handleCreateNew}
            className="border-[#2563EB] text-[#2563EB] text-[11px] font-semibold h-8 shrink-0"
          >
            Create Assignment
          </Button>
        </div>

        {/* Assignments List */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {filteredAssignments.length === 0 ? (
            <div className="p-6 text-center text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              No assignments found matching your filter.
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const isSelected = activeSelectedUuid === assignment.id;
              const isAttached = currentlyAttachedUuid === assignment.id;

              return (
                <button
                  key={assignment.id}
                  type="button"
                  onClick={() => setSelectedUuid(assignment.id)}
                  className={`w-full p-3.5 rounded-[14px] border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#2563EB] shadow-2xs'
                      : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#64748B]'
                      }`}
                    >
                      <FileCheck className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-semibold text-[#0F172A] truncate">
                          {assignment.title}
                        </strong>
                        <Badge variant={assignment.status === 'Published' ? 'success' : 'secondary'} size="sm">
                          {assignment.status}
                        </Badge>
                        {isAttached && (
                          <Badge variant="info" size="sm">Attached</Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-[#64748B] block mt-0.5 truncate">
                        {assignment.shortDescription || 'No description'}
                      </span>
                      <div className="flex items-center gap-3 text-[10px] text-[#64748B] pt-1">
                        <span>Max Marks: <strong className="text-[#2563EB] font-bold">{assignment.maxMarks}</strong></span>
                        <span>•</span>
                        <span>Pass: <strong>{assignment.passingMarks}</strong></span>
                        <span>•</span>
                        <span>Methods: {assignment.allowedSubmissionTypes.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/courses/${courseUuid}/assignments/${assignment.id}`);
                      }}
                      className="h-7 text-[10px] px-2"
                    >
                      Preview
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAssignment(assignment);
                        onClose();
                      }}
                      className={`h-7 text-[10px] px-3 font-semibold ${
                        isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#0F172A] hover:bg-blue-50 hover:text-[#2563EB]'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="outline" onClick={onClose} className="h-10 text-xs font-semibold">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedAssignment}
            onClick={handleConfirmAttach}
            className="h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs px-6"
          >
            Attach Selected Assignment
          </Button>
        </div>
      </div>
    </Modal>
  );
};

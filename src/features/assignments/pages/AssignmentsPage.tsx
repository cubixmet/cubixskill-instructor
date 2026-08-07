import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Download,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useAssignmentStore } from '../store/assignment.store';
import { AssignmentFormModal } from '../components/AssignmentFormModal';
import { AssignmentSinglePage } from './AssignmentSinglePage';
import { SubmissionDetailPage } from '../components/SubmissionDetailPage';
import { exportToCsv, type CsvColumn } from '../../../utils/export-csv';
import type { Assignment } from '../../../types/assignment.types';

export const AssignmentsPage: React.FC = () => {
  const { courseUuid, assignmentUuid, submissionUuid } = useParams<{
    courseUuid?: string;
    assignmentUuid?: string;
    submissionUuid?: string;
  }>();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldOpenCreate = searchParams.get('openCreate') === 'true';
  const returnToCurriculum = searchParams.get('returnToCurriculum') === 'true';

  // Store Selectors
  const assignments = useAssignmentStore((state) => state.assignments);
  const submissions = useAssignmentStore((state) => state.submissions);
  const addAssignment = useAssignmentStore((state) => state.addAssignment);
  const updateAssignment = useAssignmentStore((state) => state.updateAssignment);
  const deleteAssignment = useAssignmentStore((state) => state.deleteAssignment);
  const duplicateAssignment = useAssignmentStore((state) => state.duplicateAssignment);

  // Local Filter & UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'dueDate' | 'marks'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(shouldOpenCreate);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // ROUTE 1: SUBMISSION DETAIL VIEW
  if (submissionUuid) {
    const selectedSubmission = submissions.find((s) => s.id === submissionUuid) || submissions[0];
    const targetAssignment = assignments.find((a) => a.id === selectedSubmission?.assignmentUuid) || assignments[0];

    return (
      <SubmissionDetailPage
        submission={selectedSubmission}
        assignment={targetAssignment}
        onUpdateSubmission={() => {}}
      />
    );
  }

  // ROUTE 2: SINGLE ASSIGNMENT VIEW
  if (assignmentUuid) {
    return <AssignmentSinglePage />;
  }

  // Course Filtered Assignments
  const courseAssignments = courseUuid
    ? assignments.filter((a) => a.courseUuid === courseUuid)
    : assignments;

  // Dashboard Stats Calculations
  const totalCount = courseAssignments.length;
  const draftCount = courseAssignments.filter((a) => a.status === 'Draft').length;
  const publishedCount = courseAssignments.filter((a) => a.status === 'Published').length;
  const pendingReviewsCount = courseAssignments.reduce((acc, curr) => acc + (curr.pendingReviewsCount || 0), 0);
  const lateSubmissionsCount = submissions.filter((s) => s.status === 'Late').length;

  const filteredAssignments = courseAssignments
    .filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      if (sortBy === 'oldest') return a.id.localeCompare(b.id);
      if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sortBy === 'marks') return b.maxMarks - a.maxMarks;
      return 0;
    });

  const handleExportCSV = () => {
    if (filteredAssignments.length === 0) return;
    const columns: CsvColumn<Assignment>[] = [
      { header: 'Title', value: (row) => row.title },
      { header: 'Status', value: (row) => row.status },
      { header: 'Max Marks', value: (row) => row.maxMarks },
      { header: 'Passing Marks', value: (row) => row.passingMarks },
      { header: 'Due Date', value: (row) => new Date(row.dueDate).toLocaleDateString() },
      { header: 'Submissions Count', value: (row) => row.totalSubmissionsCount || 0 },
    ];
    exportToCsv('course-assignments-export.csv', filteredAssignments, columns);
  };

  return (
    <div className="space-y-6 text-left font-sans pb-12 max-w-[1600px] mx-auto">
      {/* 1. HEADER BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">Assignments</h1>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Create, manage, review and grade course assignments.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
              className="border-[#E2E8F0] text-xs font-semibold text-[#0F172A] h-10 min-h-[40px]"
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
              onClick={() => {
                setEditingAssignment(null);
                setIsCreateModalOpen(true);
              }}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-10 min-h-[40px]"
            >
              Create Assignment
            </Button>
          </div>
        </div>

        {/* 2. DASHBOARD CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-[#E2E8F0]">
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px]">
            <span className="text-[11px] font-medium text-[#64748B] block">Total Assignments</span>
            <strong className="text-base font-bold text-[#0F172A]">{totalCount}</strong>
          </div>
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px]">
            <span className="text-[11px] font-medium text-[#64748B] block">Published</span>
            <strong className="text-base font-bold text-emerald-600">{publishedCount}</strong>
          </div>
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px]">
            <span className="text-[11px] font-medium text-[#64748B] block">Drafts</span>
            <strong className="text-base font-bold text-[#64748B]">{draftCount}</strong>
          </div>
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px]">
            <span className="text-[11px] font-medium text-[#64748B] block">Pending Reviews</span>
            <strong className="text-base font-bold text-[#2563EB]">{pendingReviewsCount}</strong>
          </div>
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px]">
            <span className="text-[11px] font-medium text-[#64748B] block">Late Submissions</span>
            <strong className="text-base font-bold text-amber-600">{lateSubmissionsCount}</strong>
          </div>
        </div>

        {/* 3. SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by assignment title..."
              className="w-full h-10 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-semibold text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB]"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-semibold text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB]"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="dueDate">Sort: Due Date</option>
              <option value="marks">Sort: Max Marks</option>
            </select>

            <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B]'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B]'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTENT VIEW (TABLE VS GRID CARDS) */}
      {viewMode === 'table' ? (
        <Card padding="none" className="bg-white border border-[#E2E8F0] overflow-hidden rounded-[16px]">
          <div className="overflow-x-auto no-scrollbar font-sans">
            <table className="w-full text-left text-xs font-medium text-[#0F172A]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[10px] uppercase font-bold">
                  <th className="py-3.5 px-4">Assignment Title</th>
                  <th className="py-3.5 px-4">Max / Passing Marks</th>
                  <th className="py-3.5 px-4">Submissions</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/courses/${courseUuid || assignment.courseUuid}/assignments/${assignment.id}`)
                        }
                        className="text-left group cursor-pointer"
                      >
                        <strong className="block text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                          {assignment.title}
                        </strong>
                        <span className="text-[11px] text-[#64748B] font-normal">{assignment.shortDescription}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#2563EB]">
                      {assignment.maxMarks} Marks <span className="text-[#64748B] font-normal">({assignment.passingMarks} Pass)</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#0F172A]">
                      {assignment.totalSubmissionsCount || 0} Submissions
                      {assignment.pendingReviewsCount ? (
                        <span className="text-amber-600 font-bold block text-[10px]">{assignment.pendingReviewsCount} Pending</span>
                      ) : null}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={assignment.status === 'Published' ? 'success' : 'secondary'} size="sm">
                        {assignment.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/courses/${courseUuid || assignment.courseUuid}/assignments/${assignment.id}`)
                        }
                        className="h-8 text-[11px]"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAssignment(assignment);
                          setIsCreateModalOpen(true);
                        }}
                        className="h-8 text-[11px]"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => duplicateAssignment(assignment.id)}
                        className="h-8 text-[11px]"
                      >
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteAssignment(assignment.id)}
                        className="h-8 text-[11px] text-rose-600 border-rose-200"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="bg-white border border-[#E2E8F0] rounded-[18px] p-5 space-y-3">
              <div className="flex items-start justify-between">
                <Badge variant={assignment.status === 'Published' ? 'success' : 'secondary'} size="sm">
                  {assignment.status}
                </Badge>
                <span className="text-[11px] font-bold text-[#2563EB]">{assignment.maxMarks} Marks</span>
              </div>

              <div>
                <strong className="text-sm font-bold text-[#0F172A] block">{assignment.title}</strong>
                <p className="text-xs text-[#64748B] line-clamp-2 mt-0.5">{assignment.shortDescription}</p>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                <span className="font-semibold text-[#0F172A]">{assignment.totalSubmissionsCount || 0} Submissions</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate(`/courses/${courseUuid || assignment.courseUuid}/assignments/${assignment.id}`)
                  }
                  className="h-8 text-xs font-semibold"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingAssignment(assignment);
                    setIsCreateModalOpen(true);
                  }}
                  className="h-8 bg-[#2563EB] text-white text-xs font-semibold"
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT ASSIGNMENT DRAWER MODAL */}
      <AssignmentFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialAssignment={editingAssignment}
        onSave={(data) => {
          if (editingAssignment) {
            updateAssignment(editingAssignment.id, data);
          } else {
            const created = addAssignment({ ...data, courseUuid: courseUuid || '550e8400-e29b-41d4-a716-446655440000' });
            if (returnToCurriculum) {
              navigate(`/courses/${courseUuid || '550e8400-e29b-41d4-a716-446655440000'}/curriculum?attachedUuid=${created.id}`);
            }
          }
        }}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useAssignmentStore } from '../store/assignment.store';
import { AssignmentFormModal } from '../components/AssignmentFormModal';

export type SingleAssignmentTab = 'overview' | 'submissions' | 'pending' | 'grades' | 'analytics' | 'settings';

export const AssignmentSinglePage: React.FC = () => {
  const { courseUuid, assignmentUuid } = useParams<{ courseUuid?: string; assignmentUuid?: string }>();
  const navigate = useNavigate();

  const assignment = useAssignmentStore((state) =>
    state.assignments.find((a) => a.id === assignmentUuid)
  );

  const submissions = useAssignmentStore((state) =>
    state.submissions.filter((s) => s.assignmentUuid === assignmentUuid)
  );

  const approveSubmission = useAssignmentStore((state) => state.approveSubmission);
  const updateAssignment = useAssignmentStore((state) => state.updateAssignment);

  const [activeTab, setActiveTab] = useState<SingleAssignmentTab>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!assignment) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#0F172A]">Assignment Not Found</h2>
        <Button onClick={() => navigate(courseUuid ? `/courses/${courseUuid}/assignments` : '/assignments')}>
          Return to Assignments
        </Button>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter((s) => s.status === 'Submitted' || s.status === 'Under Review');
  const approvedSubmissions = submissions.filter((s) => s.status === 'Approved' || s.status === 'Passed');
  const averageGrade =
    approvedSubmissions.length > 0
      ? Math.round(approvedSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0) / approvedSubmissions.length)
      : 0;

  const filteredSubmissions = submissions.filter((s) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return s.studentName.toLowerCase().includes(term) || s.studentEmail.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 text-left font-sans pb-12 max-w-[1600px] mx-auto">
      {/* HEADER BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/courses/${courseUuid || assignment.courseUuid}/assignments`)}
              className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-100 rounded-xl text-[#0F172A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">{assignment.title}</h1>
                <Badge variant={assignment.status === 'Published' ? 'success' : 'secondary'} size="sm">
                  {assignment.status}
                </Badge>
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">{assignment.shortDescription}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="border-[#2563EB] text-[#2563EB] text-xs font-semibold h-10"
            >
              Edit Configuration
            </Button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-t border-[#E2E8F0] pt-3 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'submissions', label: `Submissions (${submissions.length})` },
              { id: 'pending', label: `Pending Review (${pendingSubmissions.length})` },
              { id: 'grades', label: 'Grades' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'settings', label: 'Settings' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-slate-200 hover:text-[#0F172A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 space-y-4">
              <h3 className="font-semibold text-xs text-[#0F172A] uppercase tracking-wider">Assignment Instructions</h3>
              <p className="text-xs text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                {assignment.instructions || 'No detailed instructions provided.'}
              </p>
            </Card>

            <Card className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 space-y-3">
              <h3 className="font-semibold text-xs text-[#0F172A] uppercase tracking-wider">Allowed Submission Methods</h3>
              <div className="flex flex-wrap gap-2">
                {assignment.allowedSubmissionTypes.map((type) => (
                  <Badge key={type} variant="secondary" size="sm">
                    ✓ {type}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 space-y-3">
              <h3 className="font-semibold text-xs text-[#0F172A] uppercase tracking-wider">Summary Metadata</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Max Marks:</span>
                  <strong className="text-[#2563EB] font-bold">{assignment.maxMarks}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Passing Marks:</span>
                  <strong className="text-[#2563EB] font-bold">{assignment.passingMarks}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Due Date:</span>
                  <strong className="text-[#0F172A] font-semibold">{new Date(assignment.dueDate).toLocaleDateString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Max Attempts:</span>
                  <strong className="text-[#0F172A] font-semibold">{assignment.maxAttempts}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Approval Workflow:</span>
                  <strong className="text-[#0F172A] font-semibold">{assignment.approvalWorkflow || 'Manual Review'}</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. SUBMISSIONS & 3. PENDING REVIEW */}
      {(activeTab === 'submissions' || activeTab === 'pending') && (
        <Card padding="none" className="bg-white border border-[#E2E8F0] rounded-[16px] overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name..."
                className="w-full h-9 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs font-medium text-[#0F172A]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[10px] uppercase font-bold">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'pending' ? pendingSubmissions : filteredSubmissions).map((sub) => (
                  <tr key={sub.id} className="border-b border-[#E2E8F0] hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-[#0F172A]">{sub.studentName}</td>
                    <td className="py-3 px-4 text-[#64748B]">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold text-[#2563EB]">{sub.grade ?? '--'} / {assignment.maxMarks}</td>
                    <td className="py-3 px-4">
                      <Badge variant={sub.status === 'Approved' ? 'success' : sub.status === 'Rejected' ? 'warning' : 'secondary'} size="sm">
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(
                            `/courses/${courseUuid || assignment.courseUuid}/assignments/${assignment.id}/submissions/${sub.id}`
                          )
                        }
                        className="h-8 text-[11px]"
                      >
                        Review Submission
                      </Button>
                      {sub.status !== 'Approved' && (
                        <Button
                          size="sm"
                          onClick={() => approveSubmission(sub.id, assignment.maxMarks, 'Approved by instructor')}
                          className="h-8 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: 4. GRADES */}
      {activeTab === 'grades' && (
        <Card padding="none" className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
            <h3 className="font-bold text-sm text-[#0F172A]">Gradebook Summary</h3>
            <span className="text-xs font-semibold text-[#2563EB]">Average Class Score: {averageGrade}%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
              <span className="text-xs text-[#64748B] block">Total Submissions</span>
              <strong className="text-xl font-bold text-[#0F172A]">{submissions.length}</strong>
            </div>
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
              <span className="text-xs text-[#64748B] block">Approved</span>
              <strong className="text-xl font-bold text-emerald-600">{approvedSubmissions.length}</strong>
            </div>
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
              <span className="text-xs text-[#64748B] block">Average Marks</span>
              <strong className="text-xl font-bold text-[#2563EB]">{averageGrade} / {assignment.maxMarks}</strong>
            </div>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: 5. ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 text-center space-y-1 bg-white border border-[#E2E8F0] rounded-xl">
            <span className="text-xs text-[#64748B]">Total Submissions</span>
            <strong className="text-2xl font-bold text-[#0F172A] block">{submissions.length}</strong>
          </Card>
          <Card className="p-5 text-center space-y-1 bg-white border border-[#E2E8F0] rounded-xl">
            <span className="text-xs text-[#64748B]">Pass Rate</span>
            <strong className="text-2xl font-bold text-emerald-600 block">
              {submissions.length > 0 ? Math.round((approvedSubmissions.length / submissions.length) * 100) : 0}%
            </strong>
          </Card>
          <Card className="p-5 text-center space-y-1 bg-white border border-[#E2E8F0] rounded-xl">
            <span className="text-xs text-[#64748B]">Pending Reviews</span>
            <strong className="text-2xl font-bold text-[#2563EB] block">{pendingSubmissions.length}</strong>
          </Card>
        </div>
      )}

      {/* EDIT ASSIGNMENT MODAL */}
      <AssignmentFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialAssignment={assignment}
        onSave={(updated) => updateAssignment(assignment.id, updated)}
      />
    </div>
  );
};

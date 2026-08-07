import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  CheckSquare,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import type { Submission, SubmissionStatus } from '../../../types/assignment.types';

interface SubmissionListPageProps {
  submissions: Submission[];
  onUpdateSubmissions: (updatedList: Submission[]) => void;
  assignmentUuidFilter?: string;
  courseUuidFilter?: string;
}

export const SubmissionListPage: React.FC<SubmissionListPageProps> = ({
  submissions,
  onUpdateSubmissions,
  assignmentUuidFilter,
  courseUuidFilter,
}) => {
  const navigate = useNavigate();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>(courseUuidFilter || 'all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>(assignmentUuidFilter || 'all');
  const [lateOnlyFilter, setLateOnlyFilter] = useState(false);

  // Bulk Action State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkFeedbackModalOpen, setIsBulkFeedbackModalOpen] = useState(false);
  const [bulkFeedbackText, setBulkFeedbackText] = useState('');

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (courseFilter !== 'all' && sub.courseUuid !== courseFilter) return false;
    if (assignmentFilter !== 'all' && sub.assignmentUuid !== assignmentFilter) return false;
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
    if (lateOnlyFilter && !sub.isLate) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = sub.studentName.toLowerCase().includes(term);
      const matchEmail = sub.studentEmail.toLowerCase().includes(term);
      const matchAssign = (sub.assignmentTitle || '').toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchAssign) return false;
    }
    return true;
  });

  // Select / Deselect All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredSubmissions.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Actions Handlers
  const handleBulkStatusChange = (newStatus: SubmissionStatus) => {
    const updated = submissions.map((sub) => {
      if (selectedIds.includes(sub.id)) {
        return {
          ...sub,
          status: newStatus,
          reviewerName: 'Instructor Sarah Miller',
          reviewHistory: [
            ...(sub.reviewHistory || []),
            {
              id: `rh-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: (newStatus === 'Approved' ? 'Approved' : newStatus === 'Rejected' ? 'Rejected' : 'Reviewed') as 'Approved' | 'Rejected' | 'Resubmission Requested' | 'Grade Updated' | 'Reviewed',
              reviewerName: 'Instructor Sarah Miller',
              feedback: `Bulk action status updated to ${newStatus}`,
            },
          ],
        };
      }
      return sub;
    });

    onUpdateSubmissions(updated);
    setSelectedIds([]);
  };

  const handleApplyBulkFeedback = () => {
    if (!bulkFeedbackText.trim()) return;

    const updated = submissions.map((sub) => {
      if (selectedIds.includes(sub.id)) {
        return {
          ...sub,
          writtenFeedback: bulkFeedbackText,
          reviewerName: 'Instructor Sarah Miller',
          reviewHistory: [
            ...(sub.reviewHistory || []),
            {
              id: `rh-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: 'Reviewed' as 'Approved' | 'Rejected' | 'Resubmission Requested' | 'Grade Updated' | 'Reviewed',
              reviewerName: 'Instructor Sarah Miller',
              feedback: bulkFeedbackText,
            },
          ],
        };
      }
      return sub;
    });

    onUpdateSubmissions(updated);
    setBulkFeedbackText('');
    setIsBulkFeedbackModalOpen(false);
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const exportData = filteredSubmissions.map((s) => ({
      submissionUuid: s.id,
      studentName: s.studentName,
      studentEmail: s.studentEmail,
      assignmentTitle: s.assignmentTitle,
      status: s.status,
      marksAwarded: s.marksAwarded ?? 'N/A',
      maxMarks: s.maxMarks,
      submissionDate: s.submissionDate,
      isLate: s.isLate ? 'Yes' : 'No',
    }));

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `assignment_submissions_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Unique courses & assignments for filter dropdowns
  const uniqueCourses = Array.from(
    new Map(
      submissions
        .filter((s) => s.courseUuid && s.courseTitle)
        .map((s) => [s.courseUuid, s.courseTitle])
    ).entries()
  );

  const uniqueAssignments = Array.from(
    new Map(
      submissions
        .filter((s) => s.assignmentUuid && s.assignmentTitle)
        .map((s) => [s.assignmentUuid, s.assignmentTitle])
    ).entries()
  );

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success">Approved</Badge>;
      case 'Under Review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'Submitted':
        return <Badge variant="info">Submitted</Badge>;
      case 'Resubmission Requested':
        return <Badge variant="warning">Resubmission Requested</Badge>;
      case 'Rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'Passed':
        return <Badge variant="success">Passed</Badge>;
      case 'Failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 text-left text-xs">
      {/* FILTER & SEARCH BAR */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student, email, assignment..."
              className="pl-9 w-full text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Course Filter */}
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Courses</option>
              {uniqueCourses.map(([uuid, title]) => (
                <option key={uuid} value={uuid}>
                  {title}
                </option>
              ))}
            </select>

            {/* Assignment Filter */}
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Assignments</option>
              {uniqueAssignments.map(([uuid, title]) => (
                <option key={uuid} value={uuid}>
                  {title}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Resubmission Requested">Resubmission Requested</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Late Toggle */}
            <label className="flex items-center gap-1.5 px-3 h-9 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={lateOnlyFilter}
                onChange={(e) => setLateOnlyFilter(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span>Late Submissions Only</span>
            </label>

            <Button size="sm" variant="outline" onClick={handleExportCSV} className="font-bold text-slate-700">
              <Download className="w-3.5 h-3.5 mr-1" /> Export List
            </Button>
          </div>
        </div>
      </div>

      {/* BULK REVIEW ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-blue-600 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            <span className="font-extrabold text-xs">
              {selectedIds.length} Submission{selectedIds.length > 1 ? 's' : ''} Selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              onClick={() => handleBulkStatusChange('Under Review')}
              className="bg-blue-500 hover:bg-blue-400 text-white text-[11px] font-bold"
            >
              Mark Reviewed
            </Button>
            <Button
              size="sm"
              onClick={() => handleBulkStatusChange('Approved')}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-[11px] font-bold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve Selected
            </Button>
            <Button
              size="sm"
              onClick={() => handleBulkStatusChange('Rejected')}
              className="bg-red-500 hover:bg-red-400 text-white text-[11px] font-bold"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject Selected
            </Button>
            <Button
              size="sm"
              onClick={() => handleBulkStatusChange('Resubmission Requested')}
              className="bg-amber-500 hover:bg-amber-400 text-white text-[11px] font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Request Resubmission
            </Button>
            <Button
              size="sm"
              onClick={() => setIsBulkFeedbackModalOpen(true)}
              className="bg-white text-blue-900 font-bold hover:bg-blue-50 text-[11px]"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Common Feedback
            </Button>
          </div>
        </div>
      )}

      {/* SUBMISSIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredSubmissions.length > 0 &&
                      selectedIds.length === filteredSubmissions.length
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </th>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Assignment</th>
                <th className="p-3.5">Submitted On</th>
                <th className="p-3.5 text-center">Attempt</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Marks</th>
                <th className="p-3.5">Reviewer</th>
                <th className="p-3.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                    No submissions found matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isChecked = selectedIds.includes(sub.id);
                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                        isChecked ? 'bg-blue-50/60' : ''
                      }`}
                      onClick={() =>
                        navigate(`/assignments/${sub.assignmentUuid}/submissions/${sub.id}`)
                      }
                    >
                      <td
                        className="p-3.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(sub.id)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                      </td>

                      {/* Student */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={sub.studentAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={sub.studentName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs">{sub.studentName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{sub.studentEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Assignment */}
                      <td className="p-3.5">
                        <p className="font-extrabold text-slate-800 text-xs truncate max-w-xs">{sub.assignmentTitle}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{sub.courseTitle}</p>
                      </td>

                      {/* Submitted On */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800 text-[11px]">
                            {new Date(sub.submissionDate || sub.submittedAt || new Date().toISOString()).toLocaleDateString()}
                          </p>
                          {sub.isLate && (
                            <span className="px-1.5 py-0.2 bg-red-100 text-red-800 font-extrabold text-[9px] rounded">
                              LATE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Attempt */}
                      <td className="p-3.5 text-center font-bold text-slate-700">
                        #{sub.attemptNumber} / {sub.maxAttempts}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{getStatusBadge(sub.status)}</td>

                      {/* Marks */}
                      <td className="p-3.5 text-right">
                        {sub.marksAwarded !== undefined ? (
                          <span className="font-black text-blue-700 text-xs">
                            {sub.marksAwarded} / {sub.maxMarks}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold text-[11px]">—</span>
                        )}
                      </td>

                      {/* Reviewer */}
                      <td className="p-3.5 text-slate-500 font-medium text-[11px]">
                        {sub.reviewerName || 'Unassigned'}
                      </td>

                      {/* Action Chevron */}
                      <td className="p-3.5 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BULK FEEDBACK MODAL */}
      <Modal
        isOpen={isBulkFeedbackModalOpen}
        onClose={() => setIsBulkFeedbackModalOpen(false)}
        title={`Assign Common Feedback (${selectedIds.length} Selected)`}
        maxWidth="md"
      >
        <div className="space-y-4 text-left text-xs">
          <p className="text-[11px] text-slate-600 font-medium">
            This written feedback will be recorded into the review history of all selected submissions.
          </p>
          <textarea
            value={bulkFeedbackText}
            onChange={(e) => setBulkFeedbackText(e.target.value)}
            rows={4}
            placeholder="Type common review feedback..."
            className="w-full p-3 border border-slate-200 rounded-xl font-medium text-xs focus:outline-none focus:border-blue-600 resize-none"
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsBulkFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyBulkFeedback} className="bg-blue-600 text-white font-bold">
              Apply Feedback
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

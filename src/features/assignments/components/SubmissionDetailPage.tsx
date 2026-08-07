import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  FileText,
  Clock,
  Award,
  Layers,
  Save,
  MessageSquare,
  ShieldAlert,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import type { Submission, Assignment, SubmissionStatus } from '../../../types/assignment.types';

interface SubmissionDetailPageProps {
  submission: Submission;
  assignment: Assignment;
  onUpdateSubmission: (updated: Submission) => void;
}

export const SubmissionDetailPage: React.FC<SubmissionDetailPageProps> = ({
  submission: initialSubmission,
  assignment,
  onUpdateSubmission,
}) => {
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<Submission>(initialSubmission);
  const [marksAwarded, setMarksAwarded] = useState<number>(submission.marksAwarded ?? 85);
  const [rubricScores, setRubricScores] = useState<Record<string, number>>(
    submission.rubricScores || {}
  );
  const [feedback, setFeedback] = useState<string>(submission.writtenFeedback || '');
  const [privateNotes, setPrivateNotes] = useState<string>(submission.privateNotes || '');
  const [activeAttemptTab, setActiveAttemptTab] = useState<number>(submission.attemptNumber);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const handleRubricScoreChange = (criterionId: string, score: number) => {
    const updatedRubric = { ...rubricScores, [criterionId]: score };
    setRubricScores(updatedRubric);

    // Auto-sum total marks awarded from rubric criteria if present
    const total = Object.values(updatedRubric).reduce((sum, v) => sum + (Number(v) || 0), 0);
    setMarksAwarded(total);
  };

  const handleReviewAction = (actionStatus: SubmissionStatus) => {
    const updated: Submission = {
      ...submission,
      status: actionStatus,
      marksAwarded,
      rubricScores,
      writtenFeedback: feedback,
      privateNotes,
      reviewerName: 'Instructor Sarah Miller',
      reviewHistory: [
        ...(submission.reviewHistory || []),
        {
          id: `rh-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: (actionStatus === 'Approved'
            ? 'Approved'
            : actionStatus === 'Rejected'
            ? 'Rejected'
            : actionStatus === 'Resubmission Requested'
            ? 'Resubmission Requested'
            : 'Grade Updated') as any,
          reviewerName: 'Instructor Sarah Miller',
          marksAwarded,
          feedback,
          privateNotes,
        },
      ],
    };

    setSubmission(updated);
    onUpdateSubmission(updated);

    setSaveMessage(`Submission status updated to "${actionStatus}"!`);
    setTimeout(() => setSaveMessage(''), 4000);
  };

  const handleDownloadFile = (fileName: string) => {
    const blob = new Blob([`Mock file content for ${fileName}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-left text-xs">
      {/* NAVIGATION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/assignments/${submission.assignmentUuid}/submissions`)}
            className="p-2 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 text-sm">
                Submission Evaluation: {submission.studentName}
              </h2>
              <Badge
                variant={
                  submission.status === 'Approved'
                    ? 'success'
                    : submission.status === 'Rejected'
                    ? 'error'
                    : submission.status === 'Resubmission Requested'
                    ? 'warning'
                    : 'neutral'
                }
              >
                {submission.status}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {submission.assignmentTitle} • {submission.courseTitle}
            </p>
          </div>
        </div>

        {/* REVIEW ACTIONS */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => handleReviewAction('Approved')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
          </Button>
          <Button
            size="sm"
            onClick={() => handleReviewAction('Rejected')}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold"
          >
            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
          </Button>
          <Button
            size="sm"
            onClick={() => handleReviewAction('Resubmission Requested')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Request Resubmission
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReviewAction(submission.status)}
            className="font-bold text-slate-700"
          >
            <Save className="w-3.5 h-3.5 mr-1" /> Save Evaluation
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: SUBMISSION CONTENT & ATTEMPTS */}
        <div className="lg:col-span-2 space-y-6">
          {/* STUDENT DETAILS & ATTEMPT SELECTOR */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={submission.studentAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={submission.studentName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/20 shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{submission.studentName}</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{submission.studentEmail}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Student UUID: {submission.studentUuid}</p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Submitted On</span>
                <span className="font-extrabold text-slate-800 text-xs">
                  {new Date(submission.submissionDate || submission.submittedAt || Date.now()).toLocaleString()}
                </span>
                {submission.isLate ? (
                  <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 font-extrabold text-[9px] rounded-md block">
                    {submission.lateDurationFormatted || 'Late Submission'}
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[9px] rounded-md block">
                    On Time
                  </span>
                )}
              </div>
            </div>

            {/* Attempt Tabs */}
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950">
                Attempt History
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: submission.maxAttempts || 1 }, (_, i) => i + 1).map((attemptNum: number) => (
                  <button
                    key={attemptNum}
                    type="button"
                    onClick={() => setActiveAttemptTab(attemptNum)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                      activeAttemptTab === attemptNum
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Attempt #{attemptNum} {attemptNum === submission.attemptNumber ? '(Active)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SUBMITTED TEXT CONTENT */}
          {submission.submittedText && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Submitted Text Response
              </h4>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl font-medium text-slate-800 text-xs leading-relaxed">
                {submission.submittedText}
              </div>
            </div>
          )}

          {/* SUBMITTED FILES LIST */}
          {submission.submittedFiles && submission.submittedFiles.length > 0 && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Submitted Files ({submission.submittedFiles.length})
                </h4>
                <span className="text-[10px] font-bold text-slate-400">Media Credit Rules Enforced</span>
              </div>

              <div className="space-y-2">
                {submission.submittedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase flex items-center justify-center shrink-0">
                        {file.format}
                      </div>
                      <div className="truncate">
                        <p className="font-extrabold text-slate-900 text-xs truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{file.sizeMb} MB • Deliverable</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadFile(file.name)}
                        className="font-bold text-blue-600 border-blue-200"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXTERNAL URL */}
          {submission.externalUrl && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                Submitted External Link / Repository
              </h4>
              <a
                href={submission.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-blue-50 border border-blue-200 rounded-xl font-bold text-blue-700 text-xs flex items-center justify-between hover:bg-blue-100 transition-colors"
              >
                <span className="truncate">{submission.externalUrl}</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            </div>
          )}

          {/* ASSIGNMENT INSTRUCTIONS REFERENCE */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-700">
              Assignment Instructions Reference
            </h4>
            <div className="text-[11px] text-slate-600 font-medium leading-relaxed whitespace-pre-line">
              {assignment.instructions}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RUBRIC EVALUATION, MARKS & WRITTEN FEEDBACK */}
        <div className="space-y-6">
          {/* MARKS & RUBRIC EVALUATION CARD */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                Marks & Rubric Grading
              </h4>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block">Passing Threshold</span>
                <span className="font-bold text-slate-700 text-xs">{submission.passingMarks} Marks</span>
              </div>
            </div>

            {/* Total Marks Awarded Box */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Total Awarded Score</span>
                <span className="text-xs text-blue-600 font-medium">Out of {submission.maxMarks} Max Marks</span>
              </div>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={submission.maxMarks}
                  value={marksAwarded}
                  onChange={(e) => setMarksAwarded(Number(e.target.value))}
                  className="w-24 font-black text-blue-800 text-lg text-center bg-white"
                />
                <span className="font-extrabold text-blue-900 text-xs">/ {submission.maxMarks}</span>
              </div>
            </div>

            {/* Interactive Rubric Criteria Breakdown */}
            {assignment.rubric && assignment.rubric.length > 0 && (
              <div className="space-y-3 pt-1">
                <h5 className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider">
                  Rubric Criteria Scoring
                </h5>
                {assignment.rubric.map((criterion) => (
                  <div key={criterion.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs">{criterion.title}</span>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          max={criterion.maxMarks}
                          value={rubricScores[criterion.id] ?? 0}
                          onChange={(e) => handleRubricScoreChange(criterion.id, Number(e.target.value))}
                          className="w-16 font-extrabold text-blue-700 text-xs text-center bg-white"
                        />
                        <span className="text-[10px] font-bold text-slate-400">/ {criterion.maxMarks}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">{criterion.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INSTRUCTOR WRITTEN FEEDBACK & PRIVATE NOTES */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Written Feedback & Notes
            </h4>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Student Written Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="Constructive feedback displayed directly to student..."
                className="w-full p-3 border border-slate-200 rounded-xl font-medium text-xs focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Private Instructor Notes (Internal Only)
              </label>
              <textarea
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                rows={2}
                placeholder="Internal evaluation notes hidden from student..."
                className="w-full p-3 bg-amber-50/60 border border-amber-200 rounded-xl font-medium text-xs focus:outline-none focus:border-amber-600 resize-none"
              />
            </div>
          </div>

          {/* REVIEW HISTORY TIMELINE */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-600" />
              Audit Review History
            </h4>

            <div className="space-y-2">
              {(submission.reviewHistory || []).map((history) => (
                <div key={history.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-900">{history.action}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(history.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">By: {history.reviewerName}</p>
                  {history.feedback && (
                    <p className="text-[10px] text-slate-600 font-medium italic mt-0.5">"{history.feedback}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

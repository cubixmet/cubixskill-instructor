import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  Check,
  Lock,
  Layers,
  Upload,
  AlertCircle,
  Info,
  Globe,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileCode,
  FolderGit2,
  ExternalLink,
  ShieldCheck,
  Eye,
  Sliders,
  X,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type {
  Assignment,
  AssignmentStatus,
  SubmissionType,
  ProgressRule,
} from '../../../types/assignment.types';
import { RubricBuilder } from './RubricBuilder';

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: Assignment) => void;
  initialAssignment?: Assignment | null;
  courseUuid?: string;
}

export type MainStep = 'general' | 'content' | 'settings';
export type BuilderSection = 'general' | 'submission' | 'workflow' | 'locks' | 'review' | 'preview';

const MAIN_STEPS: { id: MainStep; label: string; number: number }[] = [
  { id: 'general', label: 'General', number: 1 },
  { id: 'content', label: 'Content', number: 2 },
  { id: 'settings', label: 'Settings', number: 3 },
];

const SECTIONS_NAV: { id: BuilderSection; title: string; desc: string; icon: React.ElementType }[] = [
  { id: 'general', title: 'General Info', desc: 'Title, description, marks', icon: FileCheck },
  { id: 'submission', title: 'Submission', desc: 'Enabled submission channels', icon: Layers },
  { id: 'workflow', title: 'Approval', desc: 'Auto approve & attempt rules', icon: ShieldCheck },
  { id: 'locks', title: 'Lock Rules', desc: 'Sequential learning gates', icon: Lock },
  { id: 'review', title: 'Review', desc: 'Rubric & grading criteria', icon: Sliders },
  { id: 'preview', title: 'Preview', desc: 'Student live view simulation', icon: Eye },
];

const SUBMISSION_METHODS_CONFIG: {
  id: SubmissionType;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  { id: 'text', label: 'Text Answer', desc: 'Student gets a rich text editor', icon: FileText },
  { id: 'url', label: 'External URL', desc: 'Website, Portfolio, or Link', icon: Globe },
  { id: 'file', label: 'File Upload', desc: 'PDF, DOCX, ZIP, MP4, MP3, etc.', icon: Upload },
  { id: 'image', label: 'Image Upload', desc: 'PNG, JPG, SVG image files only', icon: ImageIcon },
  { id: 'video', label: 'Video Upload', desc: 'Video file or streaming URL', icon: Video },
  { id: 'audio', label: 'Audio Upload', desc: 'Audio recording file or audio URL', icon: Music },
  { id: 'document', label: 'Document Upload', desc: 'PDF, Word DOCX, PowerPoint PPTX', icon: FileText },
  { id: 'zip', label: 'ZIP Upload', desc: 'ZIP, RAR, source code package', icon: FileCode },
  { id: 'git', label: 'GitHub Repository', desc: 'GitHub, GitLab, Bitbucket URL', icon: FolderGit2 },
  { id: 'gdrive', label: 'Google Drive Link', desc: 'Shared Google Drive link', icon: ExternalLink },
];

export const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAssignment,
  courseUuid = '550e8400-e29b-41d4-a716-446655440000',
}) => {
  const isEditing = Boolean(initialAssignment);

  // Main Steps & Sub Sections State
  const [mainStep, setMainStep] = useState<MainStep>('general');
  const [activeSection, setActiveSection] = useState<BuilderSection>('general');

  // Mobile Student Preview Drawer State
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialAssignment?.title || '');
  const [shortDesc, setShortDesc] = useState(initialAssignment?.shortDescription || '');
  const [instructions, setInstructions] = useState(initialAssignment?.instructions || '');
  const [maxMarks, setMaxMarks] = useState(initialAssignment?.maxMarks || 100);
  const [passingMarks, setPassingMarks] = useState(initialAssignment?.passingMarks || 75);
  const [dueDate, setDueDate] = useState(initialAssignment?.dueDate ? initialAssignment.dueDate.slice(0, 10) : '2026-08-20');
  const [dueTime, setDueTime] = useState(initialAssignment?.dueTime || '23:59');
  const [status, setStatus] = useState<AssignmentStatus>(initialAssignment?.status || 'Published');

  // Submission Types
  const [allowedTypes, setAllowedTypes] = useState<SubmissionType[]>(
    initialAssignment?.allowedSubmissionTypes || ['text', 'file', 'git']
  );

  // File Upload Settings
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(
    initialAssignment?.fileUploadSettings?.maxFileSizeMb || 100
  );
  const [allowedExtensions, setAllowedExtensions] = useState(
    initialAssignment?.fileUploadSettings?.allowedExtensions?.join(', ') || '.pdf, .docx, .zip, .mp4'
  );
  const [maxFiles, setMaxFiles] = useState(initialAssignment?.fileUploadSettings?.maxFiles || 5);
  const [allowReplace, setAllowReplace] = useState(initialAssignment?.fileUploadSettings?.allowReplace ?? true);
  const [allowMultipleFiles, setAllowMultipleFiles] = useState(initialAssignment?.fileUploadSettings?.allowMultipleFiles ?? true);

  // Workflow & Lock Rules
  const [approvalWorkflow, setApprovalWorkflow] = useState<'auto_approval' | 'auto_approve' | 'manual_review'>(
    initialAssignment?.approvalWorkflow || 'manual_review'
  );
  const [maxAttempts, setMaxAttempts] = useState(initialAssignment?.maxAttempts || 3);
  const [isUnlimitedAttempts, setIsUnlimitedAttempts] = useState(initialAssignment?.maxAttempts === 99);
  const [allowResubmission, setAllowResubmission] = useState(initialAssignment?.allowResubmission ?? true);
  const [maxResubmissions, setMaxResubmissions] = useState(initialAssignment?.resubmissionSettings?.maxResubmissions || 2);

  // Progress Rules
  const [progressRules, setProgressRules] = useState<ProgressRule[]>(
    initialAssignment?.progressRules || ['unlock_next_lesson', 'unlock_next_module']
  );

  // Rubric State
  const [rubric, setRubric] = useState(initialAssignment?.rubric || []);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSubmissionType = (typeId: SubmissionType) => {
    if (allowedTypes.includes(typeId)) {
      if (allowedTypes.length > 1) {
        setAllowedTypes(allowedTypes.filter((t) => t !== typeId));
      }
    } else {
      setAllowedTypes([...allowedTypes, typeId]);
    }
  };

  const isFileUploadEnabled = allowedTypes.some((t) =>
    ['file', 'image', 'audio', 'video', 'document', 'zip'].includes(t)
  );

  const toggleProgressRule = (rule: ProgressRule) => {
    if (progressRules.includes(rule)) {
      setProgressRules(progressRules.filter((r) => r !== rule));
    } else {
      setProgressRules([...progressRules, rule]);
    }
  };

  const handleSubmitForm = (asDraft = false) => {
    if (!title.trim()) {
      setErrorMsg('Assignment title is required');
      setActiveSection('general');
      return;
    }

    if (maxMarks <= 0) {
      setErrorMsg('Maximum marks must be greater than zero');
      setActiveSection('general');
      return;
    }

    if (passingMarks > maxMarks) {
      setErrorMsg('Passing marks cannot exceed maximum marks');
      setActiveSection('general');
      return;
    }

    setErrorMsg(null);

    const assignmentData: Assignment = {
      id: initialAssignment?.id || `assign-${Date.now()}`,
      courseUuid,
      title,
      shortDescription: shortDesc,
      instructions,
      maxMarks,
      passingMarks,
      dueDate: `${dueDate}T${dueTime}`,
      dueTime,
      maxAttempts: isUnlimitedAttempts ? 99 : maxAttempts,
      submissionOpeningDate: '2026-08-01T00:00',
      submissionClosingDate: `${dueDate}T${dueTime}`,
      status: asDraft ? 'Draft' : status,

      allowedSubmissionTypes: allowedTypes,
      fileUploadSettings: {
        maxFileSizeMb,
        allowedExtensions: allowedExtensions.split(',').map((s) => s.trim()),
        maxFiles,
        allowReplace,
        allowMultipleFiles,
      },
      reviewMode: approvalWorkflow === 'manual_review' ? 'manual' : 'auto_approval',
      approvalWorkflow,
      lateSubmissionRule: 'deduct_percentage',
      allowResubmission,
      resubmissionSettings: {
        allowResubmission,
        maxResubmissions,
        reasonRequired: true,
        autoLockAfterLimit: true,
      },
      requirePassingMarks: true,
      notifyStudentAfterReview: true,

      progressRules,
      unlockRule: 'unlock_on_approval',

      mediaCreditRule: {
        maxFileMb: maxFileSizeMb,
        allowedTypes: allowedExtensions.split(',').map((s) => s.trim()),
        estMediaCredits: Math.round((maxFileSizeMb / 100) * 10) / 10,
      },

      rubric,
      totalSubmissionsCount: initialAssignment?.totalSubmissionsCount || 0,
      pendingReviewsCount: initialAssignment?.pendingReviewsCount || 0,
    };

    onSave(assignmentData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 font-sans text-left overflow-hidden bg-[#F8FAFC]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs"
        />

        {/* Modal Main Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-[1440px] h-full sm:h-[92vh] bg-[#F8FAFC] rounded-none sm:rounded-[20px] shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden"
        >
          {/* 1. STICKY TOP HEADER */}
          <div className="bg-white px-4 sm:px-6 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors shrink-0 cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-[#0F172A] tracking-tight truncate leading-snug">
                  {isEditing ? 'Edit Assignment' : 'Assignment Builder'}
                </h1>
                <p className="text-xs text-[#64748B] font-normal truncate hidden sm:block">
                  Configure submission requirements, evaluation rules, and sequential unlocking.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSubmitForm(true)}
                className="h-9 px-3 text-xs font-semibold whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5 mr-1.5 text-[#64748B]" />
                Save Draft
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. TOP MAIN STEP PROGRESS (Equal width, compact numbered circles) */}
          <div className="bg-white px-4 sm:px-6 py-2.5 border-b border-[#E2E8F0] shrink-0">
            <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto">
              {MAIN_STEPS.map((step) => {
                const isCurrent = mainStep === step.id;
                const isCompleted = step.number < (mainStep === 'general' ? 1 : mainStep === 'content' ? 2 : 3);

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      setMainStep(step.id);
                      setActiveSection(step.id === 'general' ? 'general' : step.id === 'content' ? 'submission' : 'locks');
                    }}
                    className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#2563EB] text-white shadow-2xs'
                        : isCompleted
                        ? 'bg-blue-50 text-[#2563EB]'
                        : 'bg-slate-100 text-[#64748B]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-bold ${
                        isCurrent
                          ? 'bg-white text-[#2563EB]'
                          : isCompleted
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-slate-200 text-[#64748B]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.number}
                    </div>
                    <span className="truncate">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. MOBILE SECTION CHIP ROW (< 768px - Horizontally Scrollable) */}
          <div className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border-b border-[#E2E8F0] overflow-x-auto no-scrollbar shrink-0">
            {SECTIONS_NAV.map((sec) => {
              const isCurrent = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 min-h-[40px] ${
                    isCurrent
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                  }`}
                >
                  {sec.title}
                </button>
              );
            })}

            {/* Mobile Student Preview Button Trigger */}
            <button
              type="button"
              onClick={() => setIsPreviewDrawerOpen(true)}
              className="px-3.5 py-2 rounded-full text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 whitespace-nowrap transition-all shrink-0 min-h-[40px] flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
              Preview Student View
            </button>
          </div>

          {/* 4. MAIN BODY: 3-COLUMN DESKTOP (240px | flex-1 | 340px) vs 1-COLUMN MOBILE */}
          <div className="flex-1 flex overflow-hidden">
            {/* COLUMN 1: LEFT VERTICAL NAVIGATION (240px - DESKTOP ONLY) */}
            <div className="hidden md:flex w-[240px] bg-white border-r border-[#E2E8F0] p-4 flex-col gap-1.5 shrink-0 overflow-y-auto no-scrollbar">
              <span className="text-[11px] font-semibold uppercase text-[#64748B] tracking-wider px-3 mb-1">
                Builder Sections
              </span>

              {SECTIONS_NAV.map((sec) => {
                const Icon = sec.icon;
                const isCurrent = activeSection === sec.id;

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full p-3 rounded-[14px] text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#2563EB] text-white shadow-2xs font-medium'
                        : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#64748B]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <strong className={`text-xs block leading-tight truncate ${isCurrent ? 'text-white' : 'text-[#0F172A]'}`}>
                        {sec.title}
                      </strong>
                      <span className={`text-[10px] block mt-0.5 truncate ${isCurrent ? 'text-blue-100' : 'text-[#64748B]'}`}>
                        {sec.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* COLUMN 2: CENTER FLEXIBLE FORM */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-[16px] text-rose-900 font-medium flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* SECTION 1: GENERAL INFO */}
              {(activeSection === 'general' || activeSection === 'preview') && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 sm:p-6 space-y-5 shadow-2xs"
                >
                  <div className="border-b border-[#E2E8F0] pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[#0F172A]">General Information</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Basic assignment details, description, and scoring marks.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[#0F172A]">
                        Assignment Title <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Build Custom React 19 Store Middleware"
                        className="w-full h-[46px] px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[#0F172A]">Short Summary</label>
                      <input
                        type="text"
                        value={shortDesc}
                        onChange={(e) => setShortDesc(e.target.value)}
                        placeholder="Brief summary displayed in curriculum list"
                        className="w-full h-[46px] px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[#0F172A]">Detailed Description & Instructions</label>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={4}
                        placeholder="Detailed instructions, requirements, deliverables, and submission steps..."
                        className="w-full min-h-[120px] p-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#0F172A]">Maximum Marks</label>
                        <input
                          type="number"
                          min={1}
                          value={maxMarks}
                          onChange={(e) => setMaxMarks(Number(e.target.value))}
                          className="w-full h-[46px] px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-semibold text-[#2563EB] focus:outline-none focus:border-[#2563EB]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#0F172A]">Passing Marks</label>
                        <input
                          type="number"
                          min={1}
                          value={passingMarks}
                          onChange={(e) => setPassingMarks(Number(e.target.value))}
                          className="w-full h-[46px] px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-semibold text-[#2563EB] focus:outline-none focus:border-[#2563EB]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#0F172A]">Due Date</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full h-[46px] px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#0F172A]">Due Time</label>
                        <input
                          type="time"
                          value={dueTime}
                          onChange={(e) => setDueTime(e.target.value)}
                          className="w-full h-[46px] px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#0F172A]">Initial Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as 'Published' | 'Draft' | 'Scheduled' | 'Closed' | 'Archived')}
                          className="w-full h-[46px] px-3 bg-white border border-[#E2E8F0] rounded-[12px] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                        >
                          <option value="Published">Published</option>
                          <option value="Draft">Draft</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Closed">Closed</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SECTION 2: SUBMISSION METHODS */}
              {(activeSection === 'submission' || activeSection === 'preview') && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 sm:p-6 space-y-5 shadow-2xs"
                >
                  <div className="border-b border-[#E2E8F0] pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[#0F172A]">Submission Methods</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Instructor enables allowed submission channels for students.</p>
                  </div>

                  {/* INSTRUCTOR FILE UPLOAD CREDIT WARNING */}
                  {isFileUploadEnabled && (
                    <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-[14px] space-y-2 text-[#0F172A]">
                      <strong className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
                        File Upload Credit Usage
                      </strong>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        Students will be allowed to upload files for this assignment. Media storage credits will be deducted based on each uploaded file’s size when the upload succeeds. No credits are deducted while creating or editing this assignment.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 min-[390px]:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SUBMISSION_METHODS_CONFIG.map((item) => {
                      const Icon = item.icon;
                      const isChecked = allowedTypes.includes(item.id);

                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => toggleSubmissionType(item.id)}
                          className={`p-4 rounded-[14px] border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                            isChecked
                              ? 'bg-blue-50/70 border-[#2563EB] shadow-2xs'
                              : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isChecked ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#64748B]'
                              }`}
                            >
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <strong className="text-sm font-semibold text-[#0F172A] block leading-tight truncate">
                                {item.label}
                              </strong>
                              <span className="text-xs text-[#64748B] block mt-0.5 line-clamp-2">{item.desc}</span>
                            </div>
                          </div>

                          {isChecked && (
                            <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* FILE UPLOAD CONFIGURATION CONTROLS */}
                  {isFileUploadEnabled && (
                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] space-y-4">
                      <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                        File Upload Configuration
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-[#0F172A]">Max File Size (MB)</label>
                          <input
                            type="number"
                            min={1}
                            max={500}
                            value={maxFileSizeMb}
                            onChange={(e) => setMaxFileSizeMb(Number(e.target.value))}
                            className="w-full h-[40px] px-3 bg-white border border-[#E2E8F0] rounded-[10px] text-xs font-medium text-[#0F172A]"
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="block text-xs font-medium text-[#0F172A]">Allowed File Extensions</label>
                          <input
                            type="text"
                            value={allowedExtensions}
                            onChange={(e) => setAllowedExtensions(e.target.value)}
                            placeholder=".pdf, .docx, .zip, .mp4"
                            className="w-full h-[40px] px-3 bg-white border border-[#E2E8F0] rounded-[10px] text-xs font-medium text-[#0F172A]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-[#0F172A]">Max Files Count</label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={maxFiles}
                            onChange={(e) => setMaxFiles(Number(e.target.value))}
                            className="w-full h-[40px] px-3 bg-white border border-[#E2E8F0] rounded-[10px] text-xs font-medium text-[#0F172A]"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-5">
                          <input
                            type="checkbox"
                            id="allowReplace"
                            checked={allowReplace}
                            onChange={(e) => setAllowReplace(e.target.checked)}
                            className="w-4 h-4 rounded text-[#2563EB]"
                          />
                          <label htmlFor="allowReplace" className="text-xs font-medium text-[#0F172A] cursor-pointer">
                            Allow Replacing Uploads
                          </label>
                        </div>
                        <div className="flex items-center gap-2 pt-5">
                          <input
                            type="checkbox"
                            id="allowMultipleFiles"
                            checked={allowMultipleFiles}
                            onChange={(e) => setAllowMultipleFiles(e.target.checked)}
                            className="w-4 h-4 rounded text-[#2563EB]"
                          />
                          <label htmlFor="allowMultipleFiles" className="text-xs font-medium text-[#0F172A] cursor-pointer">
                            Allow Multiple Files
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* SECTION 3: APPROVAL WORKFLOW */}
              {(activeSection === 'workflow' || activeSection === 'preview') && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 sm:p-6 space-y-5 shadow-2xs"
                >
                  <div className="border-b border-[#E2E8F0] pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[#0F172A]">Approval & Evaluation Workflow</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Configure grading rules, attempt limits, and resubmissions.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[64px]">
                      <div>
                        <strong className="text-sm font-semibold text-[#0F172A] block">Workflow Mode</strong>
                        <span className="text-xs text-[#64748B]">Choose between instructor review or automatic pass approval</span>
                      </div>
                      <select
                        value={approvalWorkflow}
                        onChange={(e) => setApprovalWorkflow(e.target.value as 'manual_review' | 'auto_approval')}
                        className="h-[46px] px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                      >
                        <option value="manual_review">Instructor Approval Required</option>
                        <option value="auto_approval">Auto Approve Submission</option>
                      </select>
                    </div>

                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[64px]">
                      <div>
                        <strong className="text-sm font-semibold text-[#0F172A] block">Maximum Submission Attempts</strong>
                        <span className="text-xs text-[#64748B]">Set limit or enable unlimited attempts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-medium text-[#0F172A] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isUnlimitedAttempts}
                            onChange={(e) => setIsUnlimitedAttempts(e.target.checked)}
                            className="w-4 h-4 rounded text-[#2563EB]"
                          />
                          Unlimited
                        </label>
                        {!isUnlimitedAttempts && (
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={maxAttempts}
                            onChange={(e) => setMaxAttempts(Number(e.target.value))}
                            className="w-20 h-[46px] px-3 bg-white border border-[#E2E8F0] rounded-[12px] text-xs font-semibold text-center text-[#2563EB]"
                          />
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[64px]">
                      <div>
                        <strong className="text-sm font-semibold text-[#0F172A] block">Resubmission Settings</strong>
                        <span className="text-xs text-[#64748B]">Allow students to resubmit if requested or rejected</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-medium text-[#0F172A] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowResubmission}
                            onChange={(e) => setAllowResubmission(e.target.checked)}
                            className="w-4 h-4 rounded text-[#2563EB]"
                          />
                          Allow Resubmission
                        </label>
                        {allowResubmission && (
                          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                            <span>Max Limit:</span>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={maxResubmissions}
                              onChange={(e) => setMaxResubmissions(Number(e.target.value))}
                              className="w-16 h-[40px] px-2 bg-white border border-[#E2E8F0] rounded-[10px] text-xs font-semibold text-center text-[#2563EB]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SECTION 4: LOCK RULES */}
              {(activeSection === 'locks' || activeSection === 'preview') && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 sm:p-6 space-y-5 shadow-2xs"
                >
                  <div className="border-b border-[#E2E8F0] pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[#0F172A]">Sequential Lock & Unlock Rules</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Control progression gates in student course curriculum.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'unlock_next_lesson', label: 'Unlock Next Lesson', desc: 'Next lesson unlocks after submission/approval' },
                      { id: 'unlock_next_module', label: 'Unlock Next Module', desc: 'Next module unlocks upon passing assignment' },
                      { id: 'require_passing_marks', label: 'Require Minimum Passing Marks', desc: 'Students must meet passing score' },
                    ].map((item) => {
                      const isChecked = progressRules.includes(item.id as ProgressRule);
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => toggleProgressRule(item.id as ProgressRule)}
                          className={`w-full p-4 rounded-[14px] border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isChecked ? 'bg-blue-50/70 border-[#2563EB]' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white'
                          }`}
                        >
                          <div>
                            <strong className="text-sm font-semibold text-[#0F172A] block">{item.label}</strong>
                            <span className="text-xs text-[#64748B]">{item.desc}</span>
                          </div>
                          {isChecked && <Check className="w-5 h-5 text-[#2563EB] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* SECTION 5: RUBRIC & GRADING CRITERIA */}
              {(activeSection === 'review' || activeSection === 'preview') && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 sm:p-6 space-y-5 shadow-2xs"
                >
                  <div className="border-b border-[#E2E8F0] pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[#0F172A]">Rubric & Grading Criteria</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Add evaluation criteria, point weights, and guidelines for grading.</p>
                  </div>

                  <RubricBuilder criteria={rubric} onChange={setRubric} />
                </motion.div>
              )}
            </div>

            {/* COLUMN 3: RIGHT STICKY SIDEBAR (340px - DESKTOP 1280px+ ONLY) */}
            <div className="hidden xl:flex w-[340px] bg-white border-l border-[#E2E8F0] p-5 flex-col gap-5 shrink-0 overflow-y-auto no-scrollbar sticky top-0 h-full">
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <h4 className="font-semibold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#2563EB]" />
                    Live Student Preview
                  </h4>
                  <Badge variant="success" size="sm" dot>Live Sync</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <strong className="text-sm font-semibold text-[#0F172A] block">{title || 'Assignment Title'}</strong>
                    <p className="text-xs text-[#64748B] line-clamp-2 mt-0.5">{shortDesc || 'Short description preview'}</p>
                  </div>

                  <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-[#64748B]">
                      <span>Max Marks:</span>
                      <strong className="text-[#2563EB] font-bold">{maxMarks} Marks</strong>
                    </div>
                    <div className="flex justify-between text-[#64748B]">
                      <span>Due Date:</span>
                      <strong className="text-[#0F172A] font-semibold">{dueDate} {dueTime}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. STICKY BOTTOM FOOTER BAR */}
          <div className="bg-white px-4 sm:px-6 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between gap-3 shrink-0 sticky bottom-0 z-20">
            <span className="text-xs font-medium text-[#64748B] hidden sm:block">
              {isEditing ? 'Editing existing assignment' : 'Drafting new assignment'}
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-[46px] px-5 text-xs font-semibold min-h-[46px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmitForm(false)}
                className="h-[46px] px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-[12px] min-h-[46px]"
              >
                {isEditing ? 'Update Assignment' : 'Save & Publish Assignment'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MOBILE STUDENT PREVIEW FULL-SCREEN DRAWER */}
      <Modal
        isOpen={isPreviewDrawerOpen}
        onClose={() => setIsPreviewDrawerOpen(false)}
        title="Student View Preview"
        subtitle="This is how students will see and submit this assignment."
        maxWidth="md"
      >
        <div className="space-y-4 font-sans text-xs text-left">
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
            <strong className="text-base font-semibold text-[#0F172A] block">{title || 'Assignment Title'}</strong>
            <p className="text-xs text-[#64748B]">{instructions || 'No instructions provided.'}</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl font-medium">
            <span>Max Score: <strong className="text-[#2563EB] font-bold">{maxMarks} Marks</strong></span>
            <span>Due: <strong className="text-[#0F172A]">{dueDate} {dueTime}</strong></span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#0F172A] block">Submission Channels Enabled:</span>
            <div className="flex flex-wrap gap-2">
              {allowedTypes.map((typeId) => (
                <span key={typeId} className="px-2.5 py-1 bg-white border border-[#E2E8F0] rounded-lg text-[11px] font-semibold text-[#2563EB] uppercase">
                  {typeId}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end">
            <Button onClick={() => setIsPreviewDrawerOpen(false)} className="h-10 bg-[#2563EB] text-white text-xs font-semibold">
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </AnimatePresence>
  );
};

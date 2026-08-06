import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck,
  Calendar,
  Clock,
  Award,
  Sparkles,
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
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';

export interface AssignmentLessonEditorProps {
  initialValues?: any;
  onSave: (values: any) => void;
  onCancel: () => void;
}

export type BuilderStep = 'general' | 'submission' | 'workflow' | 'locks' | 'review' | 'preview';

const STEPS_NAV: { id: BuilderStep; number: string; title: string; desc: string; icon: React.ElementType }[] = [
  { id: 'general', number: '1', title: 'General Info', desc: 'Title, description, marks', icon: FileCheck },
  { id: 'submission', number: '2', title: 'Submission Methods', desc: 'Enabled submission channels', icon: Layers },
  { id: 'workflow', number: '3', title: 'Approval Workflow', desc: 'Auto approve & attempt rules', icon: ShieldCheck },
  { id: 'locks', number: '4', title: 'Lock Rules', desc: 'Sequential learning gates', icon: Lock },
  { id: 'review', number: '5', title: 'Review Settings', desc: 'Rubric & grading criteria', icon: Sliders },
  { id: 'preview', number: '6', title: 'Student Preview', desc: 'Live view simulation', icon: Eye },
];

export type SubmissionMethodId =
  | 'text'
  | 'url'
  | 'file'
  | 'image'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'document'
  | 'zip'
  | 'gdrive'
  | 'github'
  | 'figma'
  | 'external_url';

const SUBMISSION_METHODS: { id: SubmissionMethodId; label: string; desc: string; icon: React.ElementType }[] = [
  { id: 'text', label: 'Text Editor', desc: 'Student gets a rich text editor', icon: FileText },
  { id: 'url', label: 'URL Submission', desc: 'Website, Portfolio, or Link', icon: Globe },
  { id: 'file', label: 'File Upload', desc: 'Any allowed file format', icon: Upload },
  { id: 'image', label: 'Image Upload', desc: 'PNG, JPG, SVG image files', icon: ImageIcon },
  { id: 'audio', label: 'Audio Upload', desc: 'Audio file or recording link', icon: Music },
  { id: 'video', label: 'Video Upload', desc: 'MP4 file or video streaming link', icon: Video },
  { id: 'pdf', label: 'PDF Upload', desc: 'PDF documents only', icon: FileText },
  { id: 'document', label: 'Office Document Upload', desc: 'Word DOCX, PowerPoint PPTX', icon: FileText },
  { id: 'zip', label: 'ZIP / Source Code Upload', desc: 'ZIP, RAR, source package', icon: FileCode },
  { id: 'gdrive', label: 'Google Drive Link', desc: 'Shared Google Drive link', icon: ExternalLink },
  { id: 'github', label: 'GitHub Repository', desc: 'GitHub / GitLab repo URL', icon: FolderGit2 },
  { id: 'figma', label: 'Figma Link', desc: 'Figma design project link', icon: ExternalLink },
  { id: 'external_url', label: 'External URL', desc: 'Any valid HTTPS link', icon: Globe },
];

export const AssignmentLessonEditor: React.FC<AssignmentLessonEditorProps> = ({
  initialValues,
  onSave,
  onCancel,
}) => {
  const [activeStep, setActiveStep] = useState<BuilderStep>('general');

  // Step 1: General Information
  const [title, setTitle] = useState(initialValues?.title || 'React 19 RSC Middleware Assignment');
  const [shortDesc, setShortDesc] = useState(initialValues?.shortDescription || 'Build a custom store middleware.');
  const [instructions, setInstructions] = useState(initialValues?.instructions || '1. Clone starter repo\n2. Implement middleware\n3. Submit file or GitHub URL');
  const [durationMinutes, setDurationMinutes] = useState(initialValues?.durationMinutes || 60);
  const [maxMarks, setMaxMarks] = useState(initialValues?.maxMarks || 100);
  const [passingMarks, setPassingMarks] = useState(initialValues?.passingMarks || 75);
  const [dueDate, setDueDate] = useState(initialValues?.dueDate || '2026-08-25');
  const [dueTime, setDueTime] = useState(initialValues?.dueTime || '23:59');

  // Step 2: Submission Methods
  const [methods, setMethods] = useState<SubmissionMethodId[]>(
    initialValues?.methods || ['text', 'file', 'github']
  );

  // Step 3: File Upload Settings
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(initialValues?.maxFileSizeMb || 100);
  const [allowedExtensions, setAllowedExtensions] = useState(initialValues?.allowedExtensions || '.pdf, .docx, .zip, .png, .mp4');
  const [maxFiles, setMaxFiles] = useState(initialValues?.maxFiles || 5);
  const [allowMultipleFiles, setAllowMultipleFiles] = useState(initialValues?.allowMultipleFiles ?? true);

  // Step 6: Approval Workflow
  const [approvalType, setApprovalType] = useState<'auto' | 'manual'>(initialValues?.approvalType || 'manual');

  // Step 7: Learning Lock Rules
  const [lockRules, setLockRules] = useState<string[]>(
    initialValues?.lockRules || ['next_lesson', 'next_module']
  );

  const toggleMethod = (id: SubmissionMethodId) => {
    if (methods.includes(id)) {
      if (methods.length > 1) setMethods(methods.filter((m) => m !== id));
    } else {
      setMethods([...methods, id]);
    }
  };

  const isFileUploadEnabled = methods.some((m) =>
    ['file', 'image', 'audio', 'video', 'pdf', 'document', 'zip'].includes(m)
  );

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      shortDescription: shortDesc,
      instructions,
      durationMinutes,
      maxMarks,
      passingMarks,
      dueDate,
      dueTime,
      methods,
      maxFileSizeMb,
      allowedExtensions,
      maxFiles,
      allowMultipleFiles,
      approvalType,
      lockRules,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] font-sans text-left overflow-hidden">
      {/* MOBILE STEP PILLS (< 768px) */}
      <div className="md:hidden flex items-center gap-2 p-3 bg-white border-b border-[#E2E8F0] overflow-x-auto no-scrollbar shrink-0">
        {STEPS_NAV.map((step) => {
          const isCurrent = activeStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isCurrent ? 'bg-[#2563EB] text-white shadow-2xs' : 'bg-slate-100 text-[#64748B]'
              }`}
            >
              {step.number}. {step.title}
            </button>
          );
        })}
      </div>

      {/* 3-COLUMN BODY CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: LEFT VERTICAL NAVIGATION (260px - DESKTOP ONLY) */}
        <div className="hidden md:flex w-[260px] bg-white border-r border-[#E2E8F0] p-4 flex-col gap-1.5 shrink-0 overflow-y-auto no-scrollbar">
          <span className="text-[11px] font-semibold uppercase text-[#64748B] tracking-wider px-3 mb-1">
            Assignment Builder Steps
          </span>

          {STEPS_NAV.map((step) => {
            const Icon = step.icon;
            const isCurrent = activeStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
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
                    {step.title}
                  </strong>
                  <span className={`text-[10px] block mt-0.5 truncate ${isCurrent ? 'text-blue-100' : 'text-[#64748B]'}`}>
                    {step.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* COLUMN 2: CENTER FLEXIBLE FORM */}
        <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
          {/* CARD 1: GENERAL INFORMATION */}
          {(activeStep === 'general' || activeStep === 'preview') && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 space-y-5 shadow-2xs"
            >
              <div className="border-b border-[#E2E8F0] pb-3">
                <h3 className="text-[18px] font-semibold text-[#0F172A]">General Information</h3>
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
                    className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#0F172A]">Short Summary</label>
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="Brief summary displayed in curriculum list"
                    className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#0F172A]">Detailed Description & Instructions</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={4}
                    placeholder="Detailed instructions, requirements, deliverables, and submission steps..."
                    className="w-full p-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#0F172A]">Maximum Marks</label>
                    <input
                      type="number"
                      min={1}
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                      className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-semibold text-[#2563EB] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#0F172A]">Passing Marks</label>
                    <input
                      type="number"
                      min={1}
                      value={passingMarks}
                      onChange={(e) => setPassingMarks(Number(e.target.value))}
                      className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-semibold text-[#2563EB] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#0F172A]">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#0F172A]">Due Time</label>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CARD 2: SUBMISSION METHODS */}
          {(activeStep === 'submission' || activeStep === 'preview') && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 space-y-5 shadow-2xs"
            >
              <div className="border-b border-[#E2E8F0] pb-3">
                <h3 className="text-[18px] font-semibold text-[#0F172A]">Submission Methods</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Enable student submission channels using feature cards.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUBMISSION_METHODS.map((item) => {
                  const Icon = item.icon;
                  const isChecked = methods.includes(item.id);

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleMethod(item.id)}
                      className={`p-4 rounded-[14px] border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                        isChecked ? 'bg-blue-50/70 border-[#2563EB] shadow-2xs' : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
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
            </motion.div>
          )}

          {/* STICKY FOOTER BAR */}
          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-5 text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="h-11 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-[12px]">
              Save Assignment Lesson
            </Button>
          </div>
        </form>

        {/* COLUMN 3: RIGHT STICKY SIDEBAR (340px - DESKTOP ONLY) */}
        <div className="hidden lg:flex w-[340px] bg-white border-l border-[#E2E8F0] p-5 flex-col gap-5 shrink-0 overflow-y-auto no-scrollbar sticky top-0 h-full">
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

          {isFileUploadEnabled && (
            <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-[16px] space-y-3 text-[#0F172A]">
              <strong className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
                Storage Credits
              </strong>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Credits are deducted only when students upload files based on file size.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

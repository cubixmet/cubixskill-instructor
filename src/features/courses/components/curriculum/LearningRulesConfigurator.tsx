import React, { useState } from 'react';
import {
  ListOrdered,
  PlayCircle,
  FolderLock,
  HelpCircle,
  FileCheck,
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Lock,
  Eye,
  RotateCcw,
  Sparkles,
  Shield,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LearningRulesConfigurator: React.FC = () => {
  // Accordion open states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    lesson: true,
    module: true,
    quiz: false,
    assignment: false,
    exam: false,
    drip: false,
    completion: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Rule settings state
  const [rules, setRules] = useState({
    // Lesson Locking
    sequentialLearning: true,
    videoCompletionRequired: true,
    minWatchPercent: '90%',
    minWatchTime: '10 Mins',
    preventVideoSkipping: true,
    resumeVideoPlayback: true,

    // Module Locking
    lockNextModule: true,

    // Quiz Rules
    quizRequired: true,
    passingScore: '80%',
    maxAttempts: '3 Attempts',
    unlockNextLessonAfterQuizPass: true,

    // Assignment Rules
    assignmentRequired: true,
    manualApprovalRequired: true,
    unlockNextLessonAfterAssignmentApproval: true,
    allowResubmission: true,

    // Exam Rules
    finalExamRequired: true,
    minPassingMarks: '75%',
    unlockCertificateAfterPassing: true,

    // Drip Content
    unlockByDate: false,
    unlockByDaysAfterEnrollment: true,
    daysAfterEnrollment: '7 Days',
    unlockWeekly: false,
    unlockMonthly: false,

    // Course Completion
    requireAllLessons: true,
    requireAllQuizzes: true,
    requireAllAssignments: true,
    requireFinalExam: true,
    issueCertificateAutomatically: true,
  });

  const toggleRule = (key: keyof typeof rules) => {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-6 text-left max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Learning Rules & Lock Settings
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider">
            Progression Control
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Configure how students unlock lessons, pass quizzes, submit assignments, and progress through modules.
        </p>
      </div>

      {/* Accordion Group */}
      <div className="space-y-4">
        {/* 1. LESSON LOCKING */}
        <RuleSectionCard
          title="Lesson Locking"
          badge="6 Rules"
          icon={ListOrdered}
          isOpen={openSections.lesson}
          onToggle={() => toggleSection('lesson')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RuleCard
              icon={ListOrdered}
              title="Sequential Learning"
              description="Students must complete lessons in exact sequential order."
              enabled={rules.sequentialLearning}
              onToggle={() => toggleRule('sequentialLearning')}
            />
            <RuleCard
              icon={PlayCircle}
              title="Video Completion Required"
              description="Unlock the next lesson only after current video meets requirement."
              enabled={rules.videoCompletionRequired}
              onToggle={() => toggleRule('videoCompletionRequired')}
            />
            <RuleCard
              icon={Clock}
              title="Minimum Watch Percentage"
              description="Required video watch percentage to mark lesson complete."
              enabled={true}
              onToggle={() => {}}
              configurableValue={rules.minWatchPercent}
            />
            <RuleCard
              icon={Clock}
              title="Minimum Watch Time"
              description="Unlock lesson after a minimum required watch duration."
              enabled={true}
              onToggle={() => {}}
              configurableValue={rules.minWatchTime}
            />
            <RuleCard
              icon={Eye}
              title="Prevent Video Skipping"
              description="Disable fast-forward seeking controls on video player."
              enabled={rules.preventVideoSkipping}
              onToggle={() => toggleRule('preventVideoSkipping')}
            />
            <RuleCard
              icon={RotateCcw}
              title="Resume Video Playback"
              description="Automatically bookmark student's last watched playback timestamp."
              enabled={rules.resumeVideoPlayback}
              onToggle={() => toggleRule('resumeVideoPlayback')}
            />
          </div>
        </RuleSectionCard>

        {/* 2. MODULE LOCKING */}
        <RuleSectionCard
          title="Module Locking"
          badge="1 Rule"
          icon={FolderLock}
          isOpen={openSections.module}
          onToggle={() => toggleSection('module')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RuleCard
              icon={FolderLock}
              title="Lock Next Module"
              description="Only unlock the next module after all lessons in the current module are 100% completed."
              enabled={rules.lockNextModule}
              onToggle={() => toggleRule('lockNextModule')}
            />
          </div>
        </RuleSectionCard>

        {/* 3. QUIZ RULES */}
        <RuleSectionCard
          title="Quiz Rules"
          badge="4 Rules"
          icon={HelpCircle}
          isOpen={openSections.quiz}
          onToggle={() => toggleSection('quiz')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RuleCard
              icon={HelpCircle}
              title="Quiz Required"
              description="Require students to attempt lesson quizzes before progression."
              enabled={rules.quizRequired}
              onToggle={() => toggleRule('quizRequired')}
            />
            <RuleCard
              icon={Award}
              title="Passing Score"
              description="Minimum percentage grade required to pass quizzes."
              enabled={true}
              onToggle={() => {}}
              configurableValue={rules.passingScore}
            />
            <RuleCard
              icon={RotateCcw}
              title="Maximum Attempts"
              description="Limit the maximum retake attempts per quiz."
              enabled={true}
              onToggle={() => {}}
              configurableValue={rules.maxAttempts}
            />
            <RuleCard
              icon={Lock}
              title="Unlock Next Lesson After Quiz Pass"
              description="Block subsequent lessons until quiz passing score is achieved."
              enabled={rules.unlockNextLessonAfterQuizPass}
              onToggle={() => toggleRule('unlockNextLessonAfterQuizPass')}
            />
          </div>
        </RuleSectionCard>

        {/* 4. ASSIGNMENT RULES */}
        <RuleSectionCard
          title="Assignment Rules"
          badge="4 Rules"
          icon={FileCheck}
          isOpen={openSections.assignment}
          onToggle={() => toggleSection('assignment')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RuleCard
              icon={FileCheck}
              title="Assignment Required"
              description="Require homework upload before unlocking next chapter."
              enabled={rules.assignmentRequired}
              onToggle={() => toggleRule('assignmentRequired')}
            />
            <RuleCard
              icon={Shield}
              title="Manual Approval Required"
              description="Instructor must manually review and grade submitted file."
              enabled={rules.manualApprovalRequired}
              onToggle={() => toggleRule('manualApprovalRequired')}
            />
            <RuleCard
              icon={Lock}
              title="Unlock Next Lesson After Assignment Approval"
              description="Block progression until instructor approves assignment."
              enabled={rules.unlockNextLessonAfterAssignmentApproval}
              onToggle={() => toggleRule('unlockNextLessonAfterAssignmentApproval')}
            />
            <RuleCard
              icon={RotateCcw}
              title="Allow Resubmission"
              description="Permit students to upload updated files if rejected."
              enabled={rules.allowResubmission}
              onToggle={() => toggleRule('allowResubmission')}
            />
          </div>
        </RuleSectionCard>

        {/* 5. EXAM RULES */}
        <RuleSectionCard
          title="Exam Rules"
          badge="3 Rules"
          icon={Award}
          isOpen={openSections.exam}
          onToggle={() => toggleSection('exam')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RuleCard
              icon={Award}
              title="Final Exam Required"
              description="Enforce a mandatory final comprehensive exam."
              enabled={rules.finalExamRequired}
              onToggle={() => toggleRule('finalExamRequired')}
            />
            <RuleCard
              icon={Award}
              title="Minimum Passing Marks"
              description="Required passing score threshold for final exam."
              enabled={true}
              onToggle={() => {}}
              configurableValue={rules.minPassingMarks}
            />
            <RuleCard
              icon={CheckCircle2}
              title="Unlock Certificate After Passing"
              description="Issue completion credentials only after passing final exam."
              enabled={rules.unlockCertificateAfterPassing}
              onToggle={() => toggleRule('unlockCertificateAfterPassing')}
            />
          </div>
        </RuleSectionCard>

        {/* 6. DRIP CONTENT */}
        <RuleSectionCard
          title="Drip Content Schedule"
          badge="4 Modes"
          icon={Calendar}
          isOpen={openSections.drip}
          onToggle={() => toggleSection('drip')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RuleCard
              icon={Calendar}
              title="Unlock by Specific Date"
              description="Automatically release lessons on specific calendar dates."
              enabled={rules.unlockByDate}
              onToggle={() => toggleRule('unlockByDate')}
            />
            <RuleCard
              icon={Clock}
              title="Unlock by Days After Enrollment"
              description="Release lessons relative to student join date."
              enabled={rules.unlockByDaysAfterEnrollment}
              onToggle={() => toggleRule('unlockByDaysAfterEnrollment')}
              configurableValue={rules.daysAfterEnrollment}
            />
            <RuleCard
              icon={Calendar}
              title="Unlock Weekly Schedule"
              description="Drip content automatically every Monday."
              enabled={rules.unlockWeekly}
              onToggle={() => toggleRule('unlockWeekly')}
            />
            <RuleCard
              icon={Calendar}
              title="Unlock Monthly Schedule"
              description="Release one module per calendar month."
              enabled={rules.unlockMonthly}
              onToggle={() => toggleRule('unlockMonthly')}
            />
          </div>
        </RuleSectionCard>

        {/* 7. COURSE COMPLETION */}
        <RuleSectionCard
          title="Course Completion Criteria"
          badge="5 Requirements"
          icon={CheckCircle2}
          isOpen={openSections.completion}
          onToggle={() => toggleSection('completion')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RuleCard
              icon={CheckCircle2}
              title="Require All Lessons"
              description="Must watch/read 100% of curriculum lessons."
              enabled={rules.requireAllLessons}
              onToggle={() => toggleRule('requireAllLessons')}
            />
            <RuleCard
              icon={CheckCircle2}
              title="Require All Quizzes"
              description="Must achieve passing score on every quiz."
              enabled={rules.requireAllQuizzes}
              onToggle={() => toggleRule('requireAllQuizzes')}
            />
            <RuleCard
              icon={CheckCircle2}
              title="Require All Assignments"
              description="Must obtain approved grade on all submitted tasks."
              enabled={rules.requireAllAssignments}
              onToggle={() => toggleRule('requireAllAssignments')}
            />
            <RuleCard
              icon={CheckCircle2}
              title="Require Final Exam"
              description="Must pass final comprehensive exam."
              enabled={rules.requireFinalExam}
              onToggle={() => toggleRule('requireFinalExam')}
            />
            <RuleCard
              icon={Award}
              title="Issue Certificate Automatically"
              description="Generate PDF & QR verifiable certificate upon completion."
              enabled={rules.issueCertificateAutomatically}
              onToggle={() => toggleRule('issueCertificateAutomatically')}
            />
          </div>
        </RuleSectionCard>
      </div>
    </div>
  );
};

/* Section Container Accordion */
const RuleSectionCard: React.FC<{
  title: string;
  badge: string;
  icon: any;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, badge, icon: Icon, isOpen, onToggle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
    <button
      type="button"
      onClick={onToggle}
      className="w-full p-4 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer border-b border-slate-100"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60">
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">{title}</h4>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
          {badge}
        </span>
      </div>
      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-4 bg-white">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* Individual Rule Feature Card */
const RuleCard: React.FC<{
  icon: any;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  configurableValue?: string;
}> = ({ icon: Icon, title, description, enabled, onToggle, configurableValue }) => (
  <div
    onClick={onToggle}
    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between h-full space-y-3 ${
      enabled
        ? 'bg-blue-50/60 border-blue-600 shadow-2xs ring-1 ring-blue-600/20'
        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
    }`}
  >
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            enabled ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">{title}</h5>
      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>

    {configurableValue && (
      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-bold">Setting:</span>
        <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-extrabold border border-blue-200">
          {configurableValue}
        </span>
      </div>
    )}
  </div>
);
